import { TranslationLink, TranslationLinks } from '../../../../shared/constants';
import { LocalizationHelpers } from '../../../../shared/helpers';
import { Language } from '../../../../shared/models';
import { EavEntityAttributes } from '../../../../shared/models/eav';
import { FieldConfigSet } from '../../../builder/fields-builder/field-config-set.model';
import { I18nKey, I18nKeys } from './translate-menu-dialog.constants';
import { TranslateMenuDialogTemplateLanguage } from './translate-menu-dialog.models';

export function getTemplateLanguages(
  config: FieldConfigSet,
  currentLanguage: string,
  defaultLanguage: string,
  languages: Language[],
  attributes: EavEntityAttributes,
): TranslateMenuDialogTemplateLanguage[] {
  const templateLanguages = languages
    .filter(language => language.key !== currentLanguage)
    .map(language => {
      const values = attributes[config.fieldName];
      const noTranslation = !LocalizationHelpers.isEditableTranslationExist(values, language.key, defaultLanguage);
      const templateLanguage: TranslateMenuDialogTemplateLanguage = {
        key: language.key,
        disabled: noTranslation,
      };
      return templateLanguage;
    });
  return templateLanguages;
}

export function findI18nKey(translationLink: TranslationLink): I18nKey {
  switch (translationLink) {
    case TranslationLinks.Translate:
      return I18nKeys.FromPrimary;
    case TranslationLinks.DontTranslate:
      return I18nKeys.NoTranslate;
    case TranslationLinks.LinkReadOnly:
      return I18nKeys.LinkReadOnly;
    case TranslationLinks.LinkReadWrite:
      return I18nKeys.LinkShared;
    case TranslationLinks.LinkCopyFrom:
      return I18nKeys.FromOther;
  }
}
