import { FieldSettings } from '../../../../../edit-types';

export class EntityDefaultLogic {
  constructor() { }

  init(settings: FieldSettings): FieldSettings {
    const fixedSettings = { ...settings };
    if (fixedSettings.EntityType == null) { fixedSettings.EntityType = ''; }
    if (fixedSettings.AllowMultiValue == null) { fixedSettings.AllowMultiValue = false; }
    if (fixedSettings.EnableEdit == null) { fixedSettings.EnableEdit = true; }
    if (fixedSettings.EnableCreate == null) { fixedSettings.EnableCreate = true; }
    if (fixedSettings.EnableAddExisting == null) { fixedSettings.EnableAddExisting = true; }
    if (fixedSettings.EnableRemove == null) { fixedSettings.EnableRemove = true; }
    if (fixedSettings.EnableDelete == null) { fixedSettings.EnableDelete = false; }
    return fixedSettings;
  }
}
