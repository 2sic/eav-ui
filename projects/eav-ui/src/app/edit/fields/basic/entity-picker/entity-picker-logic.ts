import { FieldSettings } from '../../../../../../../edit-types/src/FieldSettings';
import { InputTypeCatalog } from '../../../../shared/fields/input-type-catalog';
import { FieldSettingsHelperBase } from '../../logic/field-settings-helper-base';
import { FieldSettingsUpdateTask } from '../../logic/field-settings-update-task';
import { PickerLogicShared } from '../../picker/picker-logic-shared';

export class EntityPickerLogic extends FieldSettingsHelperBase {
  name = InputTypeCatalog.EntityPicker;

  constructor() { super({ EntityPickerLogic }); }

  update(specs: FieldSettingsUpdateTask): FieldSettings {
    return new PickerLogicShared().preUpdate(specs).fs;
  }
}

FieldSettingsHelperBase.add(EntityPickerLogic);
