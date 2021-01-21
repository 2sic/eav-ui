import { FieldSettings } from '../../../../edit-types';

export class HiddenWrapperLogic {
  constructor() { }

  init(settings: FieldSettings): FieldSettings {
    const fixedSettings: FieldSettings = { ...settings };
    if (fixedSettings.VisibleInEditUI == null) { fixedSettings.VisibleInEditUI = true; }
    return fixedSettings;
  }
}
