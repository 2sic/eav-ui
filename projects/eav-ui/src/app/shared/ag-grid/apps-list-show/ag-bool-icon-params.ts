export interface AgBoolCellIconSetting {
  clickable?: boolean;
  tooltip: string;
  icon: string;
  url?: string;
  getUrl?: (data: any) => string;
}

export interface AgBoolCellIconSettings {
  states: Record<'true' | 'false' | string, AgBoolCellIconSetting>;
}

export interface AgBoolCellIconsParams<T = any> {
  settings(data: T): AgBoolCellIconSettings;
}

export const AgBoolCellIconsDefault: AgBoolCellIconSettings = {
  states: {
    true: {
      tooltip: 'true/on',
      icon: 'radio_button_checked',
    },
    false: {
      tooltip: 'false/off',
      icon: 'radio_button_unchecked',
    }
  }
};