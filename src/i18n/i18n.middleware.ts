// src/i18n/i18n.middleware.ts

import { Injectable, NestMiddleware } from "@nestjs/common";
import { Request, Response, NextFunction } from "express";

@Injectable()
export class I18nMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const language = req.headers["accept-language"] || "en";
    req["language"] = language.startsWith("pt") ? "pt" : "en";
    next();
  }
}
