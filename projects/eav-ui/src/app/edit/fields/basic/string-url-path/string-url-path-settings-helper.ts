import { StringUrlPath } from 'projects/edit-types/src/FieldSettings-String';
import { FieldSettings } from '../../../../../../../edit-types/src/FieldSettings';
import { InputTypeCatalog } from '../../../../shared/fields/input-type-catalog';
import { FieldSettingsHelperBase } from '../../logic/field-settings-helper-base';
import { FieldSettingsUpdateTask } from '../../logic/field-settings-update-task';

export class StringUrlPathSettingsHelper extends FieldSettingsHelperBase {
  name = InputTypeCatalog.StringUrlPath;

  constructor() { super({ InputTypeCatalog }); }

  update({ settings }: FieldSettingsUpdateTask): FieldSettings {
    const fixedSettings = { ...settings } as FieldSettings & StringUrlPath;
    fixedSettings.AutoGenerateMask ??= null;
    fixedSettings.AllowSlashes ??= false;
    return fixedSettings;
  }
}

FieldSettingsHelperBase.add(StringUrlPathSettingsHelper);
