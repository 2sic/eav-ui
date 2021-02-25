export class TranslationLinkConstants {
  static readonly Translate = 'translate';
  static readonly DontTranslate = 'dontTranslate';
  static readonly MissingDefaultLangValue = 'missingDefaultLangValue';
  static readonly LinkReadOnly = 'linkReadOnly';
  static readonly LinkReadWrite = 'linkReadWrite';
  static readonly LinkCopyFrom = 'linkCopyFrom';
}

export type TranslationLink = typeof TranslationLinkConstants[keyof typeof TranslationLinkConstants];
