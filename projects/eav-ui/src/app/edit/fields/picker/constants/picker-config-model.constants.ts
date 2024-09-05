export const PickerConfigs = {
  UiPickerSourceQuery: 'UiPickerSourceQuery',
  UiPickerSourceEntity: 'UiPickerSourceEntity',
  UiPickerSourceCustomList: 'UiPickerSourceCustomList',

  // TODO: this looks out of place here
  UiPickerModeTree: 'UiPickerModeTree',
} as const;

export type OfPickerConfig = typeof PickerConfigs[keyof typeof PickerConfigs];
