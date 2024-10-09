import { FieldSettings } from '../../../../../../../edit-types/src/FieldSettings';
import { InputTypeCatalog } from '../../../../shared/fields/input-type-catalog';
import { FieldLogicBase, FieldLogicUpdate } from '../../logic/field-logic-base';
import { PickerLogicShared } from '../../picker/picker-logic-shared';

export class EntityPickerLogic extends FieldLogicBase {
  name = InputTypeCatalog.EntityPicker;

  constructor() { super({ EntityPickerLogic }); }

  update(specs: FieldLogicUpdate): FieldSettings {
    return new PickerLogicShared().preUpdate(specs).fs;
  }
}

FieldLogicBase.add(EntityPickerLogic);
