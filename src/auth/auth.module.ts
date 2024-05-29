// src/auth/auth.module.ts
import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { UsersModule } from "../users/users.module";
import { UserDetailsModule } from "src/user-details/user-details.module";
import { JwtStrategy } from "./jwt.strategy";
import { PassportModule } from "@nestjs/passport";
import { MailerModule } from "@nestjs-modules/mailer";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { HandlebarsAdapter } from "@nestjs-modules/mailer/dist/adapters/handlebars.adapter";
import { join } from "path";

@Module({
  imports: [
    UsersModule,
    UserDetailsModule,
    PassportModule.register({ defaultStrategy: "jwt" }),
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: "30d" },
    }),
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        transport: {
          host: configService.get<string>("MAIL_HOST"),
          port: configService.get<number>("MAIL_PORT"),
          auth: {
            user: configService.get<string>("MAIL_USER"),
            pass: configService.get<string>("MAIL_PASS"),
          },
          tls: {
            rejectUnauthorized: false,
          },
        },
        defaults: {
          from: `"No Reply" <${configService.get<string>("MAIL_FROM")}>`,
        },
        template: {
          dir: join(__dirname, "..", "..", "src", "templates"),
          adapter: new HandlebarsAdapter(),
          options: {
            strict: true,
          },
        },
      }),
      inject: [ConfigService],
    }),
    ConfigModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  exports: [AuthService, JwtStrategy],
})
export class AuthModule {}
