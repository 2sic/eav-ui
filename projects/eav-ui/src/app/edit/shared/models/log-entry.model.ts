export interface LogEntry {
  error: any;
  label: string;
  severity: LogSeverity;
  time: number;
}

export const LogSeverities = {
  Error: 'error',
  Log: 'log',
  Warn: 'warn',
} as const;

export type LogSeverity = typeof LogSeverities[keyof typeof LogSeverities];
