// src/common/middlewares/language.middleware.ts
import { Injectable, NestMiddleware } from "@nestjs/common";
import { Request, Response, NextFunction } from "express";

@Injectable()
export class LanguageMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction): void {
    let language = req.headers["accept-language"]
      ? req.headers["accept-language"].split(",")[0]
      : "en";
    language = language.substring(0, 2);
    req["language"] = language;
    next();
  }
}
