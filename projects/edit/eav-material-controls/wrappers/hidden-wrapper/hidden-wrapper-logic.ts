import { FieldSettings } from '../../../../edit-types';

export class HiddenWrapperLogic {
  constructor() { }

  init(settings: FieldSettings): FieldSettings {
    const fixedSettings = { ...settings };
    if (fixedSettings.VisibleInEditUI == null) { fixedSettings.VisibleInEditUI = true; }
    return fixedSettings;
  }
}
