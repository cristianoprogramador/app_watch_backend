// src\website-monitoring\website-monitoring.service.ts

import { HttpException, HttpStatus, Injectable, Logger } from "@nestjs/common";
import { WebsiteStatusDto } from "./dto/website-status.dto";
import { WebsiteMonitoringRepository } from "./website-monitoring.repository";
import { CreateWebsiteDto } from "./dto/create-website.dto";
import { HttpMethod } from "./dto/create-route.dto";
import { Cron, CronExpression } from "@nestjs/schedule";
import { WebsiteMonitoringGateway } from "./website-monitoring.gateway";
import { UpdateWebsiteDto } from "./dto/update-website.dto";
import { PrismaService } from "src/prisma/prisma.service";
import { MailService } from "src/mail/mail.service";
import axios from "axios";

@Injectable()
export class WebsiteMonitoringService {
  private readonly logger = new Logger(WebsiteMonitoringService.name);

  // Constants for site limits and routes per user
  private readonly MAX_SITES_PER_USER = 10;
  private readonly MAX_ROUTES_PER_SITE = 20;

  constructor(
    private repository: WebsiteMonitoringRepository,
    private gateway: WebsiteMonitoringGateway,
    private prisma: PrismaService,
    private mailService: MailService
  ) {}

  // Method scheduled to run every 30 minutes
  @Cron(CronExpression.EVERY_30_MINUTES)
  async checkAllWebsites(): Promise<void> {
    const websites = await this.repository.findAllWebsites();
    const parallelChecks = 5;

    for (let i = 0; i < websites.length; i += parallelChecks) {
      const websiteChunk = websites.slice(i, i + parallelChecks);
      await Promise.all(
        websiteChunk.map((website) => this.checkWebsiteAndRoutes(website))
      );
    }
  }

  private async checkWebsiteAndRoutes(website) {
    // Check the status of the website
    const siteStatus = await this.checkWebsite(website.url, website.token);
    // Update the website status in the repository
    await this.repository.updateSiteStatus(website.uuid, siteStatus.status);

    const routesStatus = [];
    let hasRouteError = false;
    let routeWithError = "";

    // Loop through each route of the website
    for (const route of website.routes) {
      // Check the status of the current route
      const routeStatus = await this.checkRoute(route, website.token);
      // Create or update the route status in the repository
      await this.repository.createOrUpdateRouteStatus({
        routeId: route.uuid,
        status: routeStatus.status,
        response: routeStatus.response,
      });

      // Collect the status of each route
      routesStatus.push({
        routeId: route.uuid,
        route: route.route,
        status: routeStatus.status,
        response: routeStatus.response,
      });

      // Check if there is any route with an error
      if (routeStatus.status === "failure") {
        hasRouteError = true;
        routeWithError = route.route;
      }
    }

    // Send a status update to the user through the gateway
    this.gateway.sendStatusUpdate(website.userId, {
      siteUuid: website.uuid,
      name: website.name,
      status: siteStatus.status,
      routes: routesStatus,
    });

    // Send notifications based on the status of the website and its routes
    if (siteStatus.status === "offline") {
      await this.sendWebsiteErrorNotification(website.userId, website.name);
    } else if (hasRouteError) {
      await this.sendRouteErrorNotification(
        website.userId,
        website.name,
        routeWithError
      );
    }
  }

  // Function to send an email notification if the website is offline
  private async sendWebsiteErrorNotification(
    userId: string,
    websiteName: string
  ) {
    // Fetch the user details
    const user = await this.prisma.user.findUnique({
      where: { uuid: userId },
      include: { userDetails: true },
    });

    // Find the last email sent to the user for this website
    const lastEmail = await this.repository.findLastEmailSent(
      user.email,
      websiteName
    );

    // Check if the last email was sent more than 24 hours ago
    if (
      !lastEmail ||
      new Date().getTime() - new Date(lastEmail.sentAt).getTime() > 86400000
    ) {
      // Send the error notification email
      await this.mailService.sendWebsiteErrorNotification(
        user.email,
        websiteName
      );
      // Record the email sent time
      await this.repository.recordEmailSent(user.email, websiteName);
    }
  }

  // Function to send an email notification if a route has an error
  private async sendRouteErrorNotification(
    userId: string,
    websiteName: string,
    routePath: string
  ) {
    // Fetch the user details
    const user = await this.prisma.user.findUnique({
      where: { uuid: userId },
      include: { userDetails: true },
    });

    // Find the last email sent to the user for this website
    const lastEmail = await this.repository.findLastEmailSent(
      user.email,
      websiteName
    );

    // Check if the last email was sent more than 24 hours ago
    if (
      !lastEmail ||
      new Date().getTime() - new Date(lastEmail.sentAt).getTime() > 86400000
    ) {
      // Send the route error notification email
      await this.mailService.sendRouteErrorNotification(
        user.email,
        websiteName,
        routePath
      );
      // Record the email sent time
      await this.repository.recordEmailSent(user.email, websiteName);
    }
  }

  // Function to check the status of a website
  async checkWebsite(url: string, token?: string): Promise<WebsiteStatusDto> {
    try {
      // Set up headers with token if provided
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      // Make a request to the website URL
      const response = await fetch(url, { headers });

      // Return the status based on the response
      return { status: response.ok ? "online" : "offline" };
    } catch (error) {
      // Return offline status in case of an error
      return { status: "offline" };
    }
  }

  async findAllWebsites(page: number, itemsPerPage: number, search?: string) {
    try {
      const result = await this.repository.findAllWebsitesWithPagination(
        page,
        itemsPerPage,
        search
      );
      this.logger.log(`Fetched ${result.total} websites`);
      return result;
    } catch (error) {
      this.logger.error("Error fetching websites", error);
      throw error;
    }
  }

  async findAllRoutes(page: number, itemsPerPage: number, search?: string) {
    try {
      const result = await this.repository.findAllRoutesWithPagination(
        page,
        itemsPerPage,
        search
      );
      this.logger.log(`Fetched ${result.total} routes`);
      return result;
    } catch (error) {
      this.logger.error("Error fetching routes", error);
      throw error;
    }
  }

  async checkRoute(
    route,
    token?: string
  ): Promise<{ status: string; response: string }> {
    try {
      const baseUrl = route.website.url.endsWith("/")
        ? route.website.url.slice(0, -1)
        : route.website.url;

      const routePath = route.route.startsWith("/")
        ? route.route
        : `/${route.route}`;

      const fullUrl = `${baseUrl}${routePath}`;

      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const response = await axios({
        method: route.method,
        url: fullUrl,
        data: route.body ? JSON.parse(route.body) : undefined,
        headers,
      });

      return { status: "success", response: JSON.stringify(response.data) };
    } catch (error) {
      return { status: "failure", response: error.message };
    }
  }

  async deleteRoute(routeId: string): Promise<void> {
    return this.repository.deleteRoute(routeId);
  }

  async createWebsite(data: CreateWebsiteDto) {
    const userSitesCount = await this.repository.countUserSites(data.userId);
    if (userSitesCount >= this.MAX_SITES_PER_USER) {
      throw new HttpException(
        `Limite de ${this.MAX_SITES_PER_USER} sites por usuário atingido.`,
        HttpStatus.BAD_REQUEST
      );
    }

    if (data.routes.length > this.MAX_ROUTES_PER_SITE) {
      throw new HttpException(
        `Cada site pode ter no máximo ${this.MAX_ROUTES_PER_SITE} rotas.`,
        HttpStatus.BAD_REQUEST
      );
    }

    const website = await this.repository.createWebsite({
      name: data.name,
      url: data.url,
      token: data.token,
      user: { connect: { uuid: data.userId } },
      routes: {
        create: data.routes.map((route) => ({
          method: route.method as HttpMethod,
          route: route.route,
          body: route.body,
        })),
      },
    });

    const initialStatus = await this.checkWebsite(data.url, data.token);

    await this.repository.createSiteStatus({
      siteId: website.uuid,
      status: initialStatus.status,
      lastChecked: new Date(),
    });

    this.gateway.sendStatusUpdate(data.userId, {
      siteUuid: website.uuid,
      status: initialStatus.status,
    });

    return website;
  }

  async findWebsiteById(id: string) {
    return this.repository.findWebsiteById(id);
  }

  async deleteWebsite(id: string) {
    const website = await this.findWebsiteById(id);
    if (!website) {
      throw new Error(`Site com ID ${id} não encontrado`);
    }

    await this.prisma.siteCheck.deleteMany({
      where: { siteId: website.uuid },
    });

    for (const route of website.routes) {
      await this.deleteRoute(route.uuid);
    }

    return this.repository.deleteWebsite(id);
  }

  async updateWebsite(id: string, data: UpdateWebsiteDto): Promise<any> {
    const website = await this.repository.updateWebsite(id, data);
    if (website) {
      this.gateway.sendStatusUpdate(website.userId, {
        siteUuid: website.uuid,
        name: website.name,
        status: website.siteStatus.status,
      });
    }
    return website;
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

  async updateWebsiteStatus(siteId: string): Promise<void> {
    const website = await this.repository.findWebsiteById(siteId);
    if (!website) {
      throw new Error(`Site com ID ${siteId} não encontrado`);
    }

    const siteStatus = await this.checkWebsite(website.url, website.token);
    await this.repository.updateSiteStatus(website.uuid, siteStatus.status);

    const routesStatus = [];
    for (const route of website.routes) {
      const routeStatus = await this.checkRoute(
        { ...route, website },
        website.token
      );
      await this.repository.createOrUpdateRouteStatus({
        routeId: route.uuid,
        status: routeStatus.status,
        response: routeStatus.response,
      });
      routesStatus.push({
        routeId: route.uuid,
        route: route.route,
        status: routeStatus.status,
        response: routeStatus.response,
      });
    }

    this.gateway.sendStatusUpdate(website.userId, {
      siteUuid: website.uuid,
      name: website.name,
      status: siteStatus.status,
      routes: routesStatus,
    });
  }
}
