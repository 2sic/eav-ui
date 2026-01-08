import { Of } from '../../../../../../../core/type-utilities';
import { FieldSettings } from '../../../../../../../edit-types/src/FieldSettings';
import { InputTypeCatalog } from '../../../../shared/fields/input-type-catalog';
import { FieldSettingsHelperBase } from '../../logic/field-settings-helper-base';
import { FieldSettingsHelpersManager } from '../../logic/field-settings-helpers-manager';
import { FieldSettingsUpdateTask } from '../../logic/field-settings-update-task';
import { StringPickerSettingsHelper } from '../string-picker/string-picker-settings-helper';

export class NumberPickerSettingsHelper extends FieldSettingsHelperBase {
  name: Of<typeof InputTypeCatalog> = InputTypeCatalog.NumberPicker;

  constructor() { super({ NumberPickerSettingsHelper }); }

  update(specs: FieldSettingsUpdateTask<string>): FieldSettings {

    const stringLogic = FieldSettingsHelpersManager.singleton().get(InputTypeCatalog.StringPicker) as StringPickerSettingsHelper;
    return stringLogic.update(specs);

  }
}

FieldSettingsHelperBase.add(NumberPickerSettingsHelper);
