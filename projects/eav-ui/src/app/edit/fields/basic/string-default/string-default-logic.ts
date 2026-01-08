import { FieldSettingsStringDefault } from 'projects/edit-types/src/FieldSettings-String';
import { FieldSettings } from '../../../../../../../edit-types/src/FieldSettings';
import { InputTypeCatalog } from '../../../../shared/fields/input-type-catalog';
import { FieldLogicBase } from '../../logic/field-settings-helper-base';
import { FieldSettingsUpdateTask } from '../../logic/field-settings-update-task';

export class StringDefaultLogic extends FieldLogicBase {
  name = InputTypeCatalog.StringDefault;

  constructor() { super({ StringDefaultLogic }); }

  canAutoTranslate = true;

  update(specs: FieldSettingsUpdateTask): FieldSettings {
    const fixedSettings = { ...specs.settings } as FieldSettings & FieldSettingsStringDefault;
    fixedSettings.InputFontFamily ??= '';
    fixedSettings.RowCount ||= 1;
    return fixedSettings;
  }
}

FieldLogicBase.add(StringDefaultLogic);
