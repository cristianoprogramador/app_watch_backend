import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { PrismaModule } from "./prisma/prisma.module";
import { PeopleModule } from "./people/people.module";
@Module({
  imports: [PrismaModule, PeopleModule], // Certifique-se de incluir PrismaModule aqui
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
