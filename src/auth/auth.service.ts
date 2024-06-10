// src/auth/auth.service.ts
import { HttpException, HttpStatus, Injectable, Logger } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { UsersService } from "../users/users.service";
import { RegisterDto } from "./dto/register.dto";
import { Prisma } from "@prisma/client";
import { UserDetailsService } from "src/user-details/user-details.service";
import { LoginDto } from "./dto/login.dto";
import { MailerService } from "@nestjs-modules/mailer";
import { sign, verify } from "jsonwebtoken";
import { ConfigService } from "@nestjs/config";
import { OAuth2Client } from "google-auth-library";
import { GoogleLoginDto } from "./dto/google-login.dto";
import axios from "axios";
import { randomBytes } from "crypto";
import { I18nService } from "src/i18n/i18n.service";
import { Lang } from "src/common/decorators/lang.decorator";

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private readonly oAuth2Client: OAuth2Client;

  constructor(
    private usersService: UsersService,
    private userDetailsService: UserDetailsService,
    private jwtService: JwtService,
    private mailerService: MailerService,
    private configService: ConfigService,
    private i18nService: I18nService
  ) {
    this.oAuth2Client = new OAuth2Client(
      configService.get<string>("GOOGLE_CLIENT_ID")
    );
  }

  async register(registerDto: RegisterDto, @Lang() lang: string) {
    try {
      const userDetails = await this.userDetailsService.create({
        name: registerDto.name,
        email: registerDto.email,
        typeDocument: registerDto.typeDocument,
        document: registerDto.document,
      });

      const user = await this.usersService.create({
        email: registerDto.email,
        password: registerDto.password,
        userDetailsUuid: userDetails.uuid,
        type: registerDto.type,
      });

      const payload = { email: user.email, sub: user.uuid };
      const accessToken = this.jwtService.sign(payload);

      return {
        accessToken,
        userData: {
          uuid: user.uuid,
          email: user.email,
          type: user.type,
          userDetails: {
            uuid: userDetails.uuid,
            name: userDetails.name,
            profileImageUrl: userDetails.profileImageUrl || "",
          },
        },
      };
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002"
      ) {
        if (error.meta && Array.isArray(error.meta.target)) {
          if (error.meta.target.includes("email")) {
            throw new HttpException(
              this.i18nService.get("authService.email_already_exists", lang),
              HttpStatus.BAD_REQUEST
            );
          } else if (error.meta.target.includes("document")) {
            throw new HttpException(
              this.i18nService.get("authService.document_already_exists", lang),
              HttpStatus.BAD_REQUEST
            );
          }
        }
      }
      throw new HttpException(
        this.i18nService.get("authService.internal_server_error", lang),
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  async login(loginDto: LoginDto, @Lang() lang: string) {
    const user = await this.usersService.findByEmail(loginDto.email);
    if (!user) {
      throw new HttpException(
        this.i18nService.get("authService.invalid_credentials", lang),
        HttpStatus.BAD_REQUEST
      );
    }

    const passwordMatches = await this.usersService.validatePassword(
      loginDto.password,
      user.password
    );
    if (!passwordMatches) {
      throw new HttpException(
        this.i18nService.get("authService.invalid_credentials", lang),
        HttpStatus.BAD_REQUEST
      );
    }

    const payload = { email: user.email, sub: user.uuid };
    const accessToken = this.jwtService.sign(payload);
    return {
      accessToken,
      userData: {
        uuid: user.uuid,
        email: user.email,
        type: user.type,
        userDetails: {
          uuid: user.userDetails.uuid,
          name: user.userDetails.name,
          profileImageUrl: user.userDetails.profileImageUrl || "",
        },
      },
    };
  }

  async googleLogin(googleLoginDto: GoogleLoginDto) {
    const response = await axios.get(
      `https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${googleLoginDto.token}`
    );

    const payload = response.data;

    if (!payload || !payload.verified_email) {
      throw new HttpException("Invalid Google token", HttpStatus.UNAUTHORIZED);
    }

    let user = await this.usersService.findByEmailGoogle(payload.email);
    if (!user) {
      const userDetails = await this.userDetailsService.create({
        name: payload.given_name || "",
        email: payload.email,
        typeDocument: null,
        document: null,
        profileImageUrl: payload.picture,
      });

      const randomPassword = randomBytes(16).toString("hex");
      const hashedPassword =
        await this.usersService.encryptPassword(randomPassword);

      user = await this.usersService.create({
        email: payload.email,
        password: hashedPassword,
        userDetailsUuid: userDetails.uuid,
        type: "client",
      });
    }

    const accessToken = this.jwtService.sign({
      email: user.email,
      sub: user.uuid,
    });
    return {
      accessToken,
      userData: {
        uuid: user.uuid,
        email: user.email,
        type: user.type,
        userDetails: {
          uuid: user.userDetails.uuid,
          name: user.userDetails.name,
          profileImageUrl: user.userDetails.profileImageUrl || "",
        },
      },
    };
  }

  async verifyToken(token: string, lang: string) {
    try {
      const decoded = this.jwtService.verify(token, {
        secret: process.env.JWT_SECRET,
      });

      const user = await this.usersService.findByUuid(decoded.sub);
      if (!user) {
        throw new HttpException(
          this.i18nService.get("authService.user_not_found", lang),
          HttpStatus.NOT_FOUND
        );
      }

      return {
        uuid: user.uuid,
        email: user.email,
        type: user.type,
        userDetails: {
          uuid: user.userDetails.uuid,
          name: user.userDetails.name,
          profileImageUrl: user.userDetails.profileImageUrl || "",
        },
      };
    } catch (error) {
      if (error.name === "TokenExpiredError") {
        throw new HttpException(
          this.i18nService.get("authService.expired_token", lang),
          HttpStatus.UNAUTHORIZED
        );
      } else {
        throw new HttpException(
          this.i18nService.get("authService.invalid_or_expired_token", lang),
          HttpStatus.UNAUTHORIZED
        );
      }
    }
  }

  async requestResetPassword(email: string, lang: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new HttpException(
        this.i18nService.get("authService.user_not_found", lang),
        HttpStatus.NOT_FOUND
      );
    }

    const secret = this.configService.get<string>("RESET_PASSWORD_SECRET");
    const payload = { email: user.email, createdAt: new Date() };
    const resetToken = sign(payload, secret, { expiresIn: "1h" });

    const frontendUrl = this.configService.get<string>("FRONTEND_URL");
    const resetPasswordUrl = `${frontendUrl}/recover-password?token=${resetToken}`;

    await this.mailerService.sendMail({
      to: email,
      subject: "Password Reset Request",
      template: "reset-password",
      context: {
        name: user.userDetails.name,
        url: resetPasswordUrl,
      },
    });

    return {
      message: this.i18nService.get(
        "authService.password_reset_email_sent",
        lang
      ),
    };
  }

  async resetPassword(token: string, newPassword: string, lang: string) {
    const secret = this.configService.get<string>("RESET_PASSWORD_SECRET");
    try {
      const decoded = verify(token, secret) as { email: string };
      const user = await this.usersService.findByEmail(decoded.email);

      if (!user) {
        throw new HttpException("Invalid token", HttpStatus.BAD_REQUEST);
      }

      await this.usersService.updatePassword(user.uuid, newPassword);

      return {
        message: this.i18nService.get(
          "authService.password_reset_successful",
          lang
        ),
      };
    } catch (error) {
      throw new HttpException(
        this.i18nService.get("authService.invalid_or_expired_token", lang),
        HttpStatus.BAD_REQUEST
      );
    }
  }
}
