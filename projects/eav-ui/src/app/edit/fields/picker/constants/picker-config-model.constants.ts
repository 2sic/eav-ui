export const PickerSourcesCustom = {
  UiPickerSourceCustomList: 'UiPickerSourceCustomList',
  UiPickerSourceCustomCsv: 'UiPickerSourceCustomCsv',
} as const;

export const PickerConfigs = {
  ...PickerSourcesCustom,
  UiPickerSourceQuery: 'UiPickerSourceQuery',
  UiPickerSourceEntity: 'UiPickerSourceEntity',
  UiPickerSourceAppAssets: 'UiPickerSourceAppAssets',
  UiPickerSourceCss: 'UiPickerSourceCss',
} as const;

export const UiPickerModeIsTree = 'UiPickerModeTree';

