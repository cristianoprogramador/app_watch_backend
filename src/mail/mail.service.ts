// src/mail/mail.service.ts
import { Injectable } from "@nestjs/common";
import { MailerService } from "@nestjs-modules/mailer";
import {
  websiteErrorTemplate,
  routeErrorTemplate,
  recoverPasswordTemplate,
} from "./templates";

@Injectable()
export class MailService {
  constructor(private readonly mailerService: MailerService) {}

  async sendWebsiteErrorNotification(email: string, websiteName: string) {
    const html = websiteErrorTemplate(websiteName);
    await this.mailerService.sendMail({
      to: email,
      subject: "Website Offline Alert",
      html,
    });
  }

  async sendRouteErrorNotification(
    email: string,
    websiteName: string,
    routePath: string
  ) {
    const html = routeErrorTemplate(websiteName, routePath);
    await this.mailerService.sendMail({
      to: email,
      subject: "Route Error Alert",
      html,
    });
  }

  async sendRecoverPasswordEmail(email: string, name: string, url: string) {
    const html = recoverPasswordTemplate(name, url);
    await this.mailerService.sendMail({
      to: email,
      subject: "Password Reset Request",
      html,
    });
  }
}
