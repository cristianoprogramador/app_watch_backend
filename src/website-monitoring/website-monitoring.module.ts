// src/website-monitoring/website-monitoring.module.ts
import { Module } from "@nestjs/common";
import { HttpModule } from "@nestjs/axios";
import { WebsiteMonitoringService } from "./website-monitoring.service";
import { WebsiteMonitoringController } from "./website-monitoring.controller";

@Module({
  imports: [HttpModule],
  providers: [WebsiteMonitoringService],
  controllers: [WebsiteMonitoringController],
})
export class WebsiteMonitoringModule {}
