export const PickerSources = {
  UiPickerSourceQuery: 'UiPickerSourceQuery',
  UiPickerSourceEntity: 'UiPickerSourceEntity',
  UiPickerSourceCustomList: 'UiPickerSourceCustomList',
} as const;

export type PickerSource = typeof PickerSources[keyof typeof PickerSources];
