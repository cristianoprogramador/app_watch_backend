import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { PrismaModule } from "./prisma/prisma.module";
import { PeopleModule } from "./people/people.module";
import { UsersModule } from "./users/users.module";
@Module({
  imports: [PrismaModule, PeopleModule, UsersModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
