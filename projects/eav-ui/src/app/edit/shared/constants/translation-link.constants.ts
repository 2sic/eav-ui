export const TranslationLinks = {
  Translate: 'Translate',
  DontTranslate: 'DontTranslate',
  MissingDefaultLangValue: 'MissingDefaultLangValue',
  LinkReadOnly: 'LinkReadOnly',
  LinkReadWrite: 'LinkReadWrite',
  LinkCopyFrom: 'LinkCopyFrom',
} as const;

export type TranslationLink = typeof TranslationLinks[keyof typeof TranslationLinks];
