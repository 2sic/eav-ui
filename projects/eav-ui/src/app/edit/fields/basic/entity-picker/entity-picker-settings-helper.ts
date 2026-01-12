import { FieldSettings } from '../../../../../../../edit-types/src/FieldSettings';
import { InputTypeCatalog } from '../../../../shared/fields/input-type-catalog';
import { FieldSettingsHelperBase } from '../../logic/field-settings-helper-base';
import { FieldSettingsUpdateTask } from '../../logic/field-settings-update-task';
import { PickerLogicShared } from '../../picker/picker-settings-helper-shared';

export class EntityPickerSettingsHelper extends FieldSettingsHelperBase {
  name = InputTypeCatalog.EntityPicker;

  constructor() { super({ EntityPickerSettingsHelper }); }

  update(specs: FieldSettingsUpdateTask): FieldSettings {
    return new PickerLogicShared().preUpdate(specs).fs;
  }
}

FieldSettingsHelperBase.add(EntityPickerSettingsHelper);
