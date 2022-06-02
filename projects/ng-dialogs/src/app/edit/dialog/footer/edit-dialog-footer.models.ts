export const DebugTypes = {
  Data: 'data',
  Formulas: 'formulas',
  Logs: 'logs',
} as const;

export type DebugType = typeof DebugTypes[keyof typeof DebugTypes];
