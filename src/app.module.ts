// src\app.module.ts

import { Module } from "@nestjs/common";
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

@Module({
  imports: [
    PrismaModule,
    UserDetailsModule,
    UsersModule,
    AuthModule,
    ErrorLogsModule,
    WebsiteMonitoringModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_FILTER,
      useClass: CustomExceptionFilter,
    },
  ],
})
export class AppModule {}
