export const PickerConfigModels = {
  UiPickerSourceQuery: 'UiPickerSourceQuery',
  UiPickerSourceEntity: 'UiPickerSourceEntity',
  UiPickerSourceCustomList: 'UiPickerSourceCustomList',
  UiPickerModeTree: 'UiPickerModeTree',
} as const;

export type PickerConfigModel = typeof PickerConfigModels[keyof typeof PickerConfigModels];
