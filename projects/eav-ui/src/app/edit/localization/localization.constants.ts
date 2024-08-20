export const BestValueModes = {
  Default: 'Default',
  Strict: 'Strict',
} as const;

export type BestValueMode = typeof BestValueModes[keyof typeof BestValueModes];
