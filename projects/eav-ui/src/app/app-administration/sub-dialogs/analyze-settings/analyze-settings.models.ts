
export const AnalyzeParts = {
  Settings: 'Settings',
  Resources: 'Resources',
} as const /* the as const ensures that the keys/values can be strictly checked */;

export interface SettingsStackItem {
  Path: string;
  Priority: number;
  Source: string;
  TotalResults: number;
  Type: string;
  Value: string;
  _value: string;
}
