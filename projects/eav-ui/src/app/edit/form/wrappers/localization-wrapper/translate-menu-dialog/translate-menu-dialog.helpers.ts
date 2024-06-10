import { TranslationLink, TranslationLinks } from '../../../../shared/constants';
import { LocalizationHelpers } from '../../../../shared/helpers';
import { Language } from '../../../../shared/models';
import { EavEntityAttributes } from '../../../../shared/models/eav';
import { FormLanguage } from '../../../../shared/models/form-languages.model';
import { FieldConfigSet } from '../../../builder/fields-builder/field-config-set.model';
import { I18nKey, I18nKeys } from './translate-menu-dialog.constants';
import { TranslateMenuDialogTemplateLanguage } from './translate-menu-dialog.models';

export function getTemplateLanguages(
  config: FieldConfigSet,
  language: FormLanguage,
  languages: Language[],
  attributes: EavEntityAttributes,
  linkType: TranslationLink,
): TranslateMenuDialogTemplateLanguage[] {
  const templateLanguages = languages
    .filter(lang => lang.NameId !== language.current)
    .map(lang => {
      const values = attributes[config.fieldName];
      const disabled = (linkType === TranslationLinks.LinkReadWrite && !lang.IsAllowed)
        || !LocalizationHelpers.hasEditableTranslation(values, FormLanguage.diffCurrent(language, lang.NameId));
      const templateLanguage: TranslateMenuDialogTemplateLanguage = {
        key: lang.NameId,
        disabled,
      };
      return templateLanguage;
    });
  return templateLanguages;
}

export function getTemplateLanguagesWithContent(
  language: FormLanguage,
  languages: Language[],
  attributes: EavEntityAttributes,
  linkType: TranslationLink,
  translatableFields?: string[],
): TranslateMenuDialogTemplateLanguage[] {
  const templateLanguages = languages
    .filter(lang => lang.NameId !== language.current)
    .map(lang => {
      let noTranslatableFields: number = 0;
      let noTranslatableFieldsThatHaveContent: number = 0;
      let isDisabled: boolean = false;
      translatableFields.forEach(field => {
        const values = attributes[field];
        noTranslatableFields += LocalizationHelpers.noEditableTranslationFields(values, lang.NameId, language.primary);
        noTranslatableFieldsThatHaveContent += LocalizationHelpers.noEditableTranslatableFieldsWithContent(values, lang.NameId, language.primary);
        isDisabled = (linkType === TranslationLinks.LinkReadWrite && !lang.IsAllowed)
          || noTranslatableFields == 0;
      });
      const templateLanguage: TranslateMenuDialogTemplateLanguage = {
        key: lang.NameId,
        disabled: isDisabled,
        noTranslatableFields,
        noTranslatableFieldsThatHaveContent,
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
