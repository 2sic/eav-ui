import { FieldSettings } from '../../../../../edit-types';

export class StringDefaultLogic {
  constructor() { }

  init(settings: FieldSettings): FieldSettings {
    const fixedSettings = { ...settings };
    fixedSettings.RowCount ||= 1;
    return fixedSettings;
  }
}
