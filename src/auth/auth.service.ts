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

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private usersService: UsersService,
    private userDetailsService: UserDetailsService,
    private jwtService: JwtService,
    private mailerService: MailerService,
    private configService: ConfigService
  ) {}

  async register(registerDto: RegisterDto) {
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
              "Email already exists.",
              HttpStatus.BAD_REQUEST
            );
          } else if (error.meta.target.includes("document")) {
            throw new HttpException(
              "Document already exists.",
              HttpStatus.BAD_REQUEST
            );
          }
        }
      }
      throw new HttpException(
        "Internal server error",
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  async login(loginDto: LoginDto) {
    const user = await this.usersService.findByEmail(loginDto.email);
    if (!user) {
      throw new HttpException("Invalid credentials", HttpStatus.BAD_REQUEST);
    }

    const passwordMatches = await this.usersService.validatePassword(
      loginDto.password,
      user.password
    );
    if (!passwordMatches) {
      throw new HttpException("Invalid credentials", HttpStatus.BAD_REQUEST);
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

  async verifyToken(token: string) {
    try {
      const decoded = this.jwtService.verify(token, {
        secret: process.env.JWT_SECRET,
      });

      const user = await this.usersService.findByUuid(decoded.sub);
      if (!user) {
        throw new HttpException("User not found", HttpStatus.NOT_FOUND);
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
        throw new HttpException("Expired token", HttpStatus.UNAUTHORIZED);
      } else {
        throw new HttpException(
          "Invalid or expired token",
          HttpStatus.UNAUTHORIZED
        );
      }
    }
  }

  async requestResetPassword(email: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new HttpException("User not found", HttpStatus.NOT_FOUND);
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

    return { message: "Password reset email sent" };
  }

  async resetPassword(token: string, newPassword: string) {
    const secret = this.configService.get<string>("RESET_PASSWORD_SECRET");
    try {
      const decoded = verify(token, secret) as { email: string };
      const user = await this.usersService.findByEmail(decoded.email);

      if (!user) {
        throw new HttpException("Invalid token", HttpStatus.BAD_REQUEST);
      }

      await this.usersService.updatePassword(user.uuid, newPassword);

      return { message: "Password reset successful" };
    } catch (error) {
      throw new HttpException(
        "Invalid or expired token",
        HttpStatus.BAD_REQUEST
      );
    }
  }
}
