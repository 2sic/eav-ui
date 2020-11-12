import { FieldSettings } from '../../../../edit-types';

export class CollapsibleWrapperLogic {
  constructor() { }

  init(settings: FieldSettings) {
    const fixedSettings = { ...settings };
    if (fixedSettings.VisibleInEditUI == null) { fixedSettings.VisibleInEditUI = true; }
    if (fixedSettings.DefaultCollapsed == null) { fixedSettings.DefaultCollapsed = false; }
    if (fixedSettings.Notes == null) { fixedSettings.Notes = ''; }
    return fixedSettings;
  }
}
