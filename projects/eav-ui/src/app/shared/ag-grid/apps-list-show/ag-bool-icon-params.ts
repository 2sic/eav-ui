export interface AgBoolCellIconSettings {
  tooltips: Record<'true' | 'false' | string, string>;
  icons: Record<'true' | 'false' | string, string>;
}

export interface AgBoolCellIconsParams {
  settings(): AgBoolCellIconSettings;
}

export const AgBoolCellIconsDefault: AgBoolCellIconSettings = {
  tooltips: {
    true: 'true/on',
    false: 'false/off',
  },

  icons: {
    true: 'radio_button_checked',
    false: 'radio_button_unchecked',
  },
};