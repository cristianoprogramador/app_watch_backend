// src/website-monitoring/website-monitoring.service.ts
import { Injectable } from "@nestjs/common";
import { HttpService } from "@nestjs/axios";
import { AxiosResponse } from "axios";
import { lastValueFrom } from "rxjs";
import { WebsiteStatusDto } from "./dto/website-status.dto";

@Injectable()
export class WebsiteMonitoringService {
  constructor(private readonly httpService: HttpService) {}

  async checkWebsite(url: string, token?: string): Promise<WebsiteStatusDto> {
    try {
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const response: AxiosResponse = await lastValueFrom(
        this.httpService.get(url, { headers })
      );

      return { status: response.status === 200 ? "online" : "offline" };
    } catch (error) {
      return { status: "offline" };
    }
  }
}
