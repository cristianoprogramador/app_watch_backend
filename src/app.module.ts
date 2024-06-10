// src\app.module.ts

import { MiddlewareConsumer, Module, NestModule } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { PrismaModule } from "./prisma/prisma.module";
import { UsersModule } from "./users/users.module";
import { UserDetailsModule } from "./user-details/user-details.module";
import { AuthModule } from "./auth/auth.module";
import { APP_FILTER } from "@nestjs/core";
import { CustomExceptionFilter } from "./error-logs/custom-exception.filter";
import { ErrorLogsModule } from "./error-logs/error-logs.module";
import { WebsiteMonitoringModule } from "./website-monitoring/website-monitoring.module";
import { I18nService } from "./i18n/i18n.service";
import { I18nModule } from "./i18n/i18n.module";
import { LanguageMiddleware } from "./common/middlewares/language.middleware";

@Module({
  imports: [
    PrismaModule,
    UserDetailsModule,
    UsersModule,
    AuthModule,
    ErrorLogsModule,
    WebsiteMonitoringModule,
    I18nModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    I18nService,
    {
      provide: APP_FILTER,
      useClass: CustomExceptionFilter,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LanguageMiddleware).forRoutes("*");
  }
}
