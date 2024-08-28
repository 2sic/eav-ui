import { FieldSettings } from './../../../../../../../edit-types/src/FieldSettings';
import { InputTypeCatalog } from '../../../../shared/fields/input-type-catalog';
import { FieldLogicBase, FieldLogicUpdate } from '../../logic/field-logic-base';

const logThis = false;

export class DateTimeDefaultLogic extends FieldLogicBase {

  constructor() {
    super(InputTypeCatalog.DateTimeDefault, logThis);
  }


  update({ settings, tools }: FieldLogicUpdate<string[]>): FieldSettings {
    const l = this.log.fn('update', { settings, tools });
    const fixedSettings = settings;
    return l.r(fixedSettings);
  }
}

FieldLogicBase.add(DateTimeDefaultLogic);
