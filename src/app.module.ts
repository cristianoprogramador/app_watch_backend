import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { PrismaModule } from "./prisma/prisma.module";
import { PeopleModule } from "./people/people.module";
import { UsersModule } from "./users/users.module";
import { AuthModule } from "./auth/auth.module";
import { APP_FILTER } from "@nestjs/core";
import { CustomExceptionFilter } from "./error-logs/custom-exception.filter";
import { ErrorLogsService } from "./error-logs/error-logs.service";

@Module({
  imports: [PrismaModule, PeopleModule, UsersModule, AuthModule],
  controllers: [AppController],
  providers: [
    {
      provide: APP_FILTER,
      useClass: CustomExceptionFilter,
    },
    ErrorLogsService,
    AppService,
  ],
})
export class AppModule {}
