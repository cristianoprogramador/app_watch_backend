// src/website-monitoring/website-monitoring.module.ts
import { Module } from "@nestjs/common";
import { HttpModule } from "@nestjs/axios";
import { WebsiteMonitoringService } from "./website-monitoring.service";
import { WebsiteMonitoringController } from "./website-monitoring.controller";
import { WebsiteMonitoringRepository } from "./website-monitoring.repository";
import { PrismaService } from "src/prisma/prisma.service";

@Module({
  imports: [HttpModule],
  providers: [
    WebsiteMonitoringService,
    WebsiteMonitoringRepository,
    PrismaService,
  ],
  controllers: [WebsiteMonitoringController],
})
export class WebsiteMonitoringModule {}
