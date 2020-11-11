import { FieldSettings } from '../../../../../edit-types';

export class HyperlinkDefaultLogic {
  constructor() { }

  init(settings: FieldSettings): FieldSettings {
    const fixedSettings = { ...settings };
    fixedSettings.Buttons ||= 'adam,more';
    fixedSettings.FileFilter ||= '';
    fixedSettings.Paths ||= '';
    return fixedSettings;
  }
}
