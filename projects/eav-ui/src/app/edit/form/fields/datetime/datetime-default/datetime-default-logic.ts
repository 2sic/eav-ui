import { FieldSettings } from '../../../../../../../../edit-types';
import { InputTypeConstants } from '../../../../../content-type-fields/constants/input-type.constants';
import { FieldLogicBase, FieldLogicUpdate } from '../../../shared/field-logic/field-logic-base';

const logThis = false;

export class DateTimeDefaultLogic extends FieldLogicBase {

  constructor() {
    super(InputTypeConstants.DateTimeDefault, logThis);
  }


  update({ settings, tools, value }: FieldLogicUpdate<string[]>): FieldSettings {
    const l = this.log.fn('update', { settings, value, tools });
    const fixedSettings = settings;
    return l.r(fixedSettings);
  }
}

FieldLogicBase.add(DateTimeDefaultLogic);
