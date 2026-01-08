import { EmptyDefault } from 'projects/edit-types/src/FieldSettings-EmptyDefault';
import { FieldSettings } from '../../../../../../../edit-types/src/FieldSettings';
import { InputTypeCatalog } from '../../../../shared/fields/input-type-catalog';
import { FieldSettingsHelperBase } from '../../logic/field-settings-helper-base';
import { FieldSettingsUpdateTask } from '../../logic/field-settings-update-task';

export class EmptyDefaultLogic extends FieldSettingsHelperBase {
  name = InputTypeCatalog.EmptyDefault;

  constructor() { super({ EmptyDefaultLogic }); }

  update({ settings }: FieldSettingsUpdateTask): FieldSettings {
    const fixedSettings = { ...settings } as FieldSettings & EmptyDefault;
    fixedSettings.Visible ??= true;
    fixedSettings.Collapsed ??= false;
    fixedSettings.Notes ??= '';
    return fixedSettings;
  }
}

FieldSettingsHelperBase.add(EmptyDefaultLogic);
