export const DebugTypes = {
  Data: 'data',
  Functions: 'functions',
} as const;

export type DebugType = typeof DebugTypes[keyof typeof DebugTypes];
