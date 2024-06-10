// src\i18n\i18n.service.ts

import { Injectable } from "@nestjs/common";
import * as fs from "fs";
import { join } from "path";

@Injectable()
export class I18nService {
  private translations: { [key: string]: any } = {};

  constructor() {
    this.loadTranslations();
  }

  private loadTranslations() {
    const languages = ["en", "pt"];
    languages.forEach((lang) => {
      const filePath = join(process.cwd(), `src/locales/${lang}.json`);
      try {
        this.translations[lang] = JSON.parse(fs.readFileSync(filePath, "utf8"));
      } catch (error) {
        console.error(`Error loading translations for ${lang}: `, error);
      }
    });
  }

  get(key: string, lang: string): string {
    const [component, messageKey] = key.split(".");
    const translation =
      this.translations[lang] &&
      this.translations[lang][component] &&
      this.translations[lang][component][messageKey];
    return translation || `Translation missing for ${key} in ${lang}`;
  }
}
