import { TranslationLink, TranslationLinks } from '../../../../shared/constants';
import { LocalizationHelpers } from '../../../../shared/helpers';
import { Language } from '../../../../shared/models';
import { EavEntityAttributes } from '../../../../shared/models/eav';
import { FormLanguage } from '../../../../shared/models/form-languages.model';
import { I18nKey, I18nKeys } from './translate-menu-dialog.constants';
import { TranslateMenuDialogTemplateLanguage } from './translate-menu-dialog.models';

export function getTemplateLanguages(
  config: { fieldName: string }, // FieldConfigSet,
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
        || !LocalizationHelpers.hasEditableValue(values, FormLanguage.diffCurrent(language, lang.NameId));
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
      let countTranslatableFields: number = 0;
      let countTranslatableFieldsWithContent: number = 0;
      let isDisabled: boolean = false;
      const langDefToUse = FormLanguage.diffCurrent(language, lang.NameId);
      translatableFields.forEach(field => {
        const values = attributes[field];
        countTranslatableFields += LocalizationHelpers.countEditableValues(values, langDefToUse);
        countTranslatableFieldsWithContent += LocalizationHelpers.countEditableValuesWithContent(values, langDefToUse);
        isDisabled = (linkType === TranslationLinks.LinkReadWrite && !lang.IsAllowed)
          || countTranslatableFields == 0;
      });
      const templateLanguage: TranslateMenuDialogTemplateLanguage = {
        key: lang.NameId,
        disabled: isDisabled,
        noTranslatableFields: countTranslatableFields,
        noTranslatableFieldsThatHaveContent: countTranslatableFieldsWithContent,
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
