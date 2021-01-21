import { FieldSettings } from '../../../../../edit-types';

export class CustomJsonEditorLogic {
  constructor() { }

  init(settings: FieldSettings): FieldSettings {
    const fixedSettings: FieldSettings = { ...settings };
    fixedSettings.Rows ||= 5;
    return fixedSettings;
  }
}
