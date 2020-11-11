import { FieldSettings } from '../../../../../edit-types';

export class StringFontIconPickerLogic {
  constructor() { }

  init(settings: FieldSettings): FieldSettings {
    const fixedSettings = { ...settings };
    fixedSettings.Files ||= '';
    fixedSettings.CssPrefix ||= '';
    fixedSettings.ShowPrefix ||= false;
    return fixedSettings;
  }
}
