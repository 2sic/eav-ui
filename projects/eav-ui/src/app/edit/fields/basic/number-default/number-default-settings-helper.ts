import { FieldSettings } from '../../../../../../../edit-types/src/FieldSettings';
import { InputTypeCatalog } from '../../../../shared/fields/input-type-catalog';
import { FieldSettingsHelperBase } from '../../logic/field-settings-helper-base';
import { FieldSettingsUpdateTask } from '../../logic/field-settings-update-task';
import { StringDropdownSettingsHelper } from '../string-dropdown/string-dropdown-settings-helper';


export class NumberDefaultSettingsHelper extends StringDropdownSettingsHelper {
  name = InputTypeCatalog.NumberDefault;

  update(specs: FieldSettingsUpdateTask<string>): FieldSettings {
    const fixedSettings: FieldSettings = { ...super.update(specs) };
    return fixedSettings;
  }
}

FieldSettingsHelperBase.add(NumberDefaultSettingsHelper);
