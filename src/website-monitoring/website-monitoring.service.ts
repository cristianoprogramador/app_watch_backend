import { Injectable, Logger } from "@nestjs/common";
import { WebsiteStatusDto } from "./dto/website-status.dto";
import { WebsiteMonitoringRepository } from "./website-monitoring.repository";
import { CreateWebsiteDto } from "./dto/create-website.dto";
import { Prisma } from "@prisma/client";
import { Cron, CronExpression } from "@nestjs/schedule";

@Injectable()
export class WebsiteMonitoringService {
  private readonly logger = new Logger(WebsiteMonitoringService.name);
  private activeTasks = 0;
  private maxConcurrentTasks = 5;

  constructor(private repository: WebsiteMonitoringRepository) {}

  @Cron(CronExpression.EVERY_10_SECONDS)
  async checkAllWebsites(): Promise<void> {
    this.logger.debug("Checking all websites");
    const websites = await this.repository.findAllWebsites();

    for (const website of websites) {
      if (this.activeTasks < this.maxConcurrentTasks) {
        this.activeTasks++;
        this.checkWebsite(website.url, website.token)
          .then((status) => {
            this.logger.debug(
              `Website ${website.name} is currently ${status.status}`
            );
          })
          .finally(() => {
            this.activeTasks--;
          });
      }
    }
  }

  async checkWebsite(url: string, token?: string): Promise<WebsiteStatusDto> {
    try {
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const response = await fetch(url, { headers });

      return { status: response.ok ? "online" : "offline" };
    } catch (error) {
      return { status: "offline" };
    }
  }

  async createWebsite(data: CreateWebsiteDto) {
    const websiteData: Prisma.WebsiteCreateInput = {
      name: data.siteName,
      url: data.siteUrl,
      token: data.token,
      user: {
        connect: { uuid: data.userId },
      },
      routes: data.routes?.length
        ? {
            create: data.routes.map((route) => ({
              method: route.method,
              path: route.route,
              body: route.body,
            })),
          }
        : undefined,
    };
    return this.repository.createWebsite(websiteData);
  }

  async findWebsiteById(id: string) {
    return this.repository.findWebsiteById(id);
  }

  async deleteWebsite(id: string) {
    return this.repository.deleteWebsite(id);
  }

  async findAllWebsitesByUserId(
    userId: string,
    page: number,
    itemsPerPage: number,
    search?: string
  ) {
    return this.repository.findAllWebsitesByUserId(
      userId,
      page,
      itemsPerPage,
      search
    );
  }
}
