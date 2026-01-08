import { FieldSettings } from '../../../../../../../edit-types/src/FieldSettings';
import { InputTypeCatalog } from '../../../../shared/fields/input-type-catalog';
import { FieldSettingsHelperBase } from '../../logic/field-settings-helper-base';
import { FieldSettingsUpdateTask } from '../../logic/field-settings-update-task';

export class CustomGpsSettingsHelper extends FieldSettingsHelperBase {
  name = InputTypeCatalog.CustomGps;

  constructor() { super({ CustomGpsSettingsHelper }); }

  update({ settings }: FieldSettingsUpdateTask): FieldSettings {
    const fixedSettings: FieldSettings = { ...settings };
    return fixedSettings;
  }
}

FieldSettingsHelperBase.add(CustomGpsSettingsHelper);
