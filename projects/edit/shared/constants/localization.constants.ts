export enum BestValueModes {
  Default = 'Default',
  Strict = 'Strict',
}

export type BestValueMode = keyof typeof BestValueModes;
