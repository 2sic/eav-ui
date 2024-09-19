
export const AnalyzeParts = {
  Settings: 'Settings',
  Resources: 'Resources',
} as const;
export type AnalyzePart = typeof AnalyzeParts[keyof typeof AnalyzeParts];

export interface SettingsStackItem {
  Path: string;
  Priority: number;
  Source: string;
  TotalResults: number;
  Type: string;
  Value: string;
  _value: string;
}
