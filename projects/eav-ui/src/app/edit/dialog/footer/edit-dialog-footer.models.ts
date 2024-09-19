export const DebugTypes = {
  Data: 'data',
  Formulas: 'formulas',
  Logs: 'logs',
} as const /* the as const ensures that the keys/values can be strictly checked */;

export type DebugType = typeof DebugTypes[keyof typeof DebugTypes];
