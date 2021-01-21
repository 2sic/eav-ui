import { FieldSettings } from '../../../../edit-types';

export class CollapsibleWrapperLogic {
  constructor() { }

  init(settings: FieldSettings): FieldSettings {
    const fixedSettings: FieldSettings = { ...settings };
    if (fixedSettings.VisibleInEditUI == null) { fixedSettings.VisibleInEditUI = true; }
    if (fixedSettings.DefaultCollapsed == null) { fixedSettings.DefaultCollapsed = false; }
    if (fixedSettings.Notes == null) { fixedSettings.Notes = ''; }
    return fixedSettings;
  }
}
