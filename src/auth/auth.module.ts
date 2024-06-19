// src/auth/auth.module.ts
import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { UsersModule } from "../users/users.module";
import { UserDetailsModule } from "src/user-details/user-details.module";
import { JwtStrategy } from "./jwt.strategy";
import { PassportModule } from "@nestjs/passport";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { OAuth2Client } from "google-auth-library";
import { MailModule } from "src/mail/mail.module";

@Module({
  imports: [
    UsersModule,
    UserDetailsModule,
    MailModule,
    PassportModule.register({ defaultStrategy: "jwt" }),
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: "30d" },
    }),
    ConfigModule,
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtStrategy,
    {
      provide: OAuth2Client,
      useFactory: (configService: ConfigService) => {
        return new OAuth2Client(configService.get<string>("GOOGLE_CLIENT_ID"));
      },
      inject: [ConfigService],
    },
  ],
  exports: [AuthService, JwtStrategy],
})
export class AuthModule {}
