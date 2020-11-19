export class TranslationLinkConstants {
  public static readonly Translate = 'translate';
  public static readonly DontTranslate = 'dontTranslate';
  public static readonly MissingDefaultLangValue = 'missingDefaultLangValue';
  public static readonly LinkReadOnly = 'linkReadOnly';
  public static readonly LinkReadWrite = 'linkReadWrite';
  public static readonly LinkCopyFrom = 'linkCopyFrom';
}

export type TranslationLink = typeof TranslationLinkConstants[keyof typeof TranslationLinkConstants];
