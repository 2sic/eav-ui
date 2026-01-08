import { FieldSettings } from '../../../../../../../edit-types/src/FieldSettings';
import { InputTypeCatalog } from '../../../../shared/fields/input-type-catalog';
import { FieldSettingsHelperBase } from '../../logic/field-settings-helper-base';
import { FieldSettingsUpdateTask } from '../../logic/field-settings-update-task';
import { StringDropdownLogic } from '../string-dropdown/string-dropdown-logic';


export class NumberDefaultLogic extends StringDropdownLogic {
  name = InputTypeCatalog.NumberDefault;

  update(specs: FieldSettingsUpdateTask<string>): FieldSettings {
    const fixedSettings: FieldSettings = { ...super.update(specs) };
    // fixedSettings.DisableAutoTranslation = true;
    return fixedSettings;
  }
}

FieldSettingsHelperBase.add(NumberDefaultLogic);
