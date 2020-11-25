import { FieldConfigSet } from '../../../eav-dynamic-form/model/field-config';
import { TranslationLinkConstants } from '../../../shared/constants/translation-link.constants';
import { LocalizationHelper } from '../../../shared/helpers/localization-helper';
import { EavAttributes, Language } from '../../../shared/models/eav';
import { I18nKeyConstants } from './translate-menu-dialog.constants';
import { TranslateMenuDialogTemplateLanguage } from './translate-menu-dialog.models';

export function getTemplateLanguages(
  config: FieldConfigSet,
  currentLanguage: string,
  defaultLanguage: string,
  languages: Language[],
  attributes: EavAttributes,
): TranslateMenuDialogTemplateLanguage[] {
  const templateLanguages = languages
    .filter(language => language.key !== currentLanguage)
    .map(language => {
      const values = attributes[config.field.name];
      const noTranslation = !LocalizationHelper.isEditableTranslationExist(values, language.key, defaultLanguage);
      const templateLanguage: TranslateMenuDialogTemplateLanguage = {
        key: language.key,
        disabled: noTranslation,
      };
      return templateLanguage;
    });
  return templateLanguages;
}

export function findI18nKey(translationLink: string) {
  switch (translationLink) {
    case TranslationLinkConstants.Translate:
      return I18nKeyConstants.FromPrimary;
    case TranslationLinkConstants.DontTranslate:
      return I18nKeyConstants.NoTranslate;
    case TranslationLinkConstants.LinkReadOnly:
      return I18nKeyConstants.LinkReadOnly;
    case TranslationLinkConstants.LinkReadWrite:
      return I18nKeyConstants.LinkShared;
    case TranslationLinkConstants.LinkCopyFrom:
      return I18nKeyConstants.FromOther;
  }
}
