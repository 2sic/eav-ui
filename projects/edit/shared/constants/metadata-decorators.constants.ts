export const MetadataDecorators = {
  SaveEmptyDecorator: 'SaveEmptyDecorator',
} as const;

export type MetadataDecorator = typeof MetadataDecorators[keyof typeof MetadataDecorators];
