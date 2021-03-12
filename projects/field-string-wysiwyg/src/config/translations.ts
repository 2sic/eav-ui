import { TranslateService } from '@ngx-translate/core';
import { TinyType } from '../shared/models';

export class TinyMceTranslations {
  // default language
  static defaultLanguage = 'en';

  // translated languages
  static supportedLanguages = 'de,es,fr_FR,it,nl,pt_PT,uk'.split(',');

  // prefixes in the i18n files
  static prefix = 'Extension.TinyMce';
  static prefixDot = 'Extension.TinyMce.';

  /** Get a TinyMCE translation pack */
  static getLanguageOptions(currentLang: string) {
    // check if it's an additionally translated language and load the translations
    let lang = currentLang.substr(0, 2);
    lang = TinyMceTranslations.fixTranslationKey(lang);

    if (!TinyMceTranslations.supportedLanguages.includes(lang)) {
      return { language: TinyMceTranslations.defaultLanguage };
    } else {
      return { language: lang };
    }
  }

  /** Add translations to TinyMCE. Call after TinyMCE is initialized */
  static addTranslations(language: string, translateService: TranslateService, editorManager: TinyType) {
    const keys = [];
    const mceTranslations: TinyType = {};

    // find all relevant keys by querying the primary language
    const all = translateService.translations[TinyMceTranslations.defaultLanguage];
    for (const key in all) {
      if (key.indexOf(TinyMceTranslations.prefix) === 0) {
        keys.push(key);
      }
    }

    const translations = translateService.instant(keys);

    for (const key of keys) {
      mceTranslations[key.replace(TinyMceTranslations.prefixDot, '')] = translations[key];
    }

    let fixedLang = TinyMceTranslations.fixTranslationKey(language);
    if (!TinyMceTranslations.supportedLanguages.includes(fixedLang)) {
      fixedLang = TinyMceTranslations.defaultLanguage;
    }
    editorManager.addI18n(fixedLang, translations[keys[0]]);
  }

  /** TinyMCE language keys are not always the same as Angular's */
  static fixTranslationKey(key: string) {
    if (key === 'fr') { return 'fr_FR'; }
    if (key === 'pt') { return 'pt_PT'; }
    return key;
  }

}
