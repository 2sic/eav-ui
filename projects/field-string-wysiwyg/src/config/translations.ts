import type { TranslateService } from '@ngx-translate/core';
import { EavWindow } from '../../../ng-dialogs/src/app/shared/models/eav-window.model';

declare const window: EavWindow;

export class TinyMceTranslations {
  private static i18nPrefix = 'Extension.TinyMce';
  private static defaultLanguage = 'en';
  private static translatedLanguages = 'de,es,fr_FR,it,nl,pt_PT,uk'.split(',');

  /** Get TinyMCE translation pack settings */
  static getLanguageOptions(language: string) {
    const tinyLang = this.fixTranslationKey(language);

    return { language: tinyLang };
  }

  /** Add translations to TinyMCE language pack */
  static addTranslations(language: string, translateService: TranslateService): void {
    const translations: Record<string, string> = translateService.instant(this.i18nPrefix);
    const tinyLang = this.fixTranslationKey(language);

    window.tinymce.addI18n(tinyLang, translations);
  }

  /** TinyMCE language keys are not always the same as Angular's. Returns defaultLanguage if language is not yet translated */
  static fixTranslationKey(language: string): string {
    language = language.substring(0, 2).toLocaleLowerCase();

    switch (language) {
      case 'fr':
        language = 'fr_FR';
        break;
      case 'pt':
        language = 'pt_PT';
        break;
    }

    return this.translatedLanguages.includes(language) ? language : this.defaultLanguage;
  }
}
