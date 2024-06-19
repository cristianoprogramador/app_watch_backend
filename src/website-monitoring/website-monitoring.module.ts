// src/website-monitoring/website-monitoring.module.ts
import { Module } from "@nestjs/common";
import { HttpModule } from "@nestjs/axios";
import { WebsiteMonitoringService } from "./website-monitoring.service";
import { WebsiteMonitoringController } from "./website-monitoring.controller";
import { WebsiteMonitoringRepository } from "./website-monitoring.repository";
import { PrismaService } from "src/prisma/prisma.service";
import { ScheduleModule } from "@nestjs/schedule";
import { WebsiteMonitoringGateway } from "./website-monitoring.gateway";
import { MailService } from "src/mail/mail.service";

@Module({
  imports: [HttpModule, ScheduleModule.forRoot()],
  providers: [
    WebsiteMonitoringService,
    WebsiteMonitoringRepository,
    PrismaService,
    WebsiteMonitoringGateway,
    MailService,
  ],
  controllers: [WebsiteMonitoringController],
})
export class WebsiteMonitoringModule {}
