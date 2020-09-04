import { TranslationLinkConstants } from '../../../shared/constants/translation-link.constants';
import { I18nKeyConstants } from './link-to-other-language.constants';

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

export function findTranslationLink(i18nKey: string) {
  switch (i18nKey) {
    case I18nKeyConstants.FromPrimary:
      return TranslationLinkConstants.Translate;
    case I18nKeyConstants.NoTranslate:
      return TranslationLinkConstants.DontTranslate;
    case I18nKeyConstants.LinkReadOnly:
      return TranslationLinkConstants.LinkReadOnly;
    case I18nKeyConstants.LinkShared:
      return TranslationLinkConstants.LinkReadWrite;
    case I18nKeyConstants.FromOther:
      return TranslationLinkConstants.LinkCopyFrom;
  }
}
