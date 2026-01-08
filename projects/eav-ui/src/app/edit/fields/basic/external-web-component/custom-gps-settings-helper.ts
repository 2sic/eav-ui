import { FieldSettings } from '../../../../../../../edit-types/src/FieldSettings';
import { InputTypeCatalog } from '../../../../shared/fields/input-type-catalog';
import { FieldSettingsHelperBase } from '../../logic/field-settings-helper-base';
import { FieldSettingsUpdateTask } from '../../logic/field-settings-update-task';

export class CustomGpsLogic extends FieldSettingsHelperBase {
  name = InputTypeCatalog.CustomGps;

  constructor() { super({ CustomGpsLogic }); }

  update({ settings }: FieldSettingsUpdateTask): FieldSettings {
    const fixedSettings: FieldSettings = { ...settings };
    // fixedSettings.DisableAutoTranslation = true;
    return fixedSettings;
  }
}

FieldSettingsHelperBase.add(CustomGpsLogic);
