export const DebugTypes = {
  Data: 'data',
  Functions: 'functions',
  Logs: 'logs',
} as const;

export type DebugType = typeof DebugTypes[keyof typeof DebugTypes];
