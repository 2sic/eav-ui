import { FieldSettings } from '../../../../edit-types';

export class HyperlinkDefaultExpandableWrapperLogic {
  constructor() { }

  init(settings: FieldSettings): FieldSettings {
    const fixedSettings = { ...settings };
    fixedSettings.FileFilter ||= '';
    fixedSettings.Paths ||= '';
    return fixedSettings;
  }
}
