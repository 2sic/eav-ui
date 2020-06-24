import { TranslateService } from '@ngx-translate/core';

// default language
const defaultLanguage = 'en';
// translated languages
const languages = 'de,es,fr,it,uk,nl'.split(',');

// prefixes in the i18n files
const prefix = 'Extension.TinyMce';
const prefixDot = 'Extension.TinyMce.';

export class TinyMceTranslations {

  /** Get a TinyMCE translation pack */
  static getLanguageOptions(currentLang: string) {
    // check if it's an additionally translated language and load the translations
    const langShort = currentLang.substr(0, 2);
    if (languages.indexOf(langShort) === -1) {
      return {
        language: defaultLanguage,
      };
    } else {
      return {
        language: langShort,
        // language_url: '/DesktopModules/ToSIC_SexyContent/dist/i18n/lib/tinymce/' + langShort + '.js',
        // language_url: `./i18n/${langShort}.js`,
      };
    }
  }

  /** Add translations to TinyMCE. Call after TinyMCE is initialized */
  static addTranslations(language: string, translateService: TranslateService, editorManager: any) {
    const keys = [];
    const mceTranslations: any = {};

    // find all relevant keys by querying the primary language
    const all = translateService.translations[defaultLanguage];
    for (const key in all) {
      if (key.indexOf(prefix) === 0) {
        keys.push(key);
      }
    }

    const translations = translateService.instant(keys);

    for (const key of keys) {
      mceTranslations[key.replace(prefixDot, '')] = translations[key];
    }

    editorManager.addI18n(language, translations[keys[0]]);
  }

}
