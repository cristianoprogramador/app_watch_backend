import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { PrismaModule } from "./prisma/prisma.module";
import { PeopleModule } from "./people/people.module";
import { UsersModule } from "./users/users.module";
import { AuthModule } from "./auth/auth.module";
import { APP_FILTER } from "@nestjs/core";
import { CustomExceptionFilter } from "./error-logs/custom-exception.filter";
import { ErrorLogsModule } from "./error-logs/error-logs.module";

@Module({
  imports: [
    PrismaModule,
    PeopleModule,
    UsersModule,
    AuthModule,
    ErrorLogsModule,
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
