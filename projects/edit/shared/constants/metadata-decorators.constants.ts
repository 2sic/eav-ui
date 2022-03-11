export const MetadataDecorators = {
  LanguagesDecorator: 'LanguagesDecorator',
  SaveEmptyDecorator: 'SaveEmptyDecorator',
} as const;

export type MetadataDecorator = typeof MetadataDecorators[keyof typeof MetadataDecorators];
