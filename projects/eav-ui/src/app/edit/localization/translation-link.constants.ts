export const TranslationLinks = {
  Translate: 'Translate',
  DontTranslate: 'DontTranslate',
  MissingDefaultLangValue: 'MissingDefaultLangValue',
  LinkReadOnly: 'LinkReadOnly',
  LinkReadWrite: 'LinkReadWrite',
  LinkCopyFrom: 'LinkCopyFrom',
} as const /* the as const ensures that the keys/values can be strictly checked */;

export type TranslationLink = typeof TranslationLinks[keyof typeof TranslationLinks];
