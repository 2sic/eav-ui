export const I18nKeys = {
  NoTranslate: 'NoTranslate',
  FromPrimary: 'FromPrimary',
  FromOther: 'FromOther',
  LinkReadOnly: 'LinkReadOnly',
  LinkShared: 'LinkShared',
} as const /* the as const ensures that the keys/values can be strictly checked */;

export type I18nKey = typeof I18nKeys[keyof typeof I18nKeys];
