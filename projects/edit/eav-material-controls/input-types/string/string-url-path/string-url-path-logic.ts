import { FieldSettings } from '../../../../../edit-types';

export class StringUrlPathLogic {
  constructor() { }

  init(settings: FieldSettings): FieldSettings {
    const fixedSettings = { ...settings };
    fixedSettings.AutoGenerateMask ||= null;
    fixedSettings.AllowSlashes ||= false;
    return fixedSettings;
  }
}
