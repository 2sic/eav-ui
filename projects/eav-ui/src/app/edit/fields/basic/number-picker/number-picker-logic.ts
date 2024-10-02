import { Of } from 'projects/core';
import { FieldSettings } from '../../../../../../../edit-types/src/FieldSettings';
import { InputTypeCatalog } from '../../../../shared/fields/input-type-catalog';
import { FieldLogicBase, FieldLogicUpdate } from '../../logic/field-logic-base';
import { FieldLogicManager } from '../../logic/field-logic-manager';
import { StringPickerLogic } from '../string-picker/string-picker-logic';

export class NumberPickerLogic extends FieldLogicBase {
  name: Of<typeof InputTypeCatalog> = InputTypeCatalog.NumberPicker;

  constructor() { super({NumberPickerLogic}); }

  update(specs: FieldLogicUpdate<string>): FieldSettings {

    const stringLogic = FieldLogicManager.singleton().get(InputTypeCatalog.StringPicker) as StringPickerLogic;
    return stringLogic.update(specs);

  }
}

FieldLogicBase.add(NumberPickerLogic);
