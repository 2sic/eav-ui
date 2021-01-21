import { FieldSettings } from '../../../../../edit-types';

export class StringUrlPathLogic {
  constructor() { }

  init(settings: FieldSettings): FieldSettings {
    const fixedSettings: FieldSettings = { ...settings };
    fixedSettings.AutoGenerateMask ||= null;
    fixedSettings.AllowSlashes ||= false;
    return fixedSettings;
  }
}
