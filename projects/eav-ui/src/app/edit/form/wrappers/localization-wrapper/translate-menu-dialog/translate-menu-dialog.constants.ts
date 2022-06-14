export const I18nKeys = {
  NoTranslate: 'NoTranslate',
  FromPrimary: 'FromPrimary',
  FromOther: 'FromOther',
  LinkReadOnly: 'LinkReadOnly',
  LinkShared: 'LinkShared',
} as const;

export type I18nKey = typeof I18nKeys[keyof typeof I18nKeys];
