export const PickerSourcesCustom = {
  UiPickerSourceCustomList: 'UiPickerSourceCustomList',
  UiPickerSourceCustomCsv: 'UiPickerSourceCustomCsv',
} as const;

export const PickerConfigs = {
  ...PickerSourcesCustom,
  UiPickerSourceQuery: 'UiPickerSourceQuery',
  UiPickerSourceEntity: 'UiPickerSourceEntity',

  // TODO: this looks out of place here
  UiPickerModeTree: 'UiPickerModeTree',
} as const;

