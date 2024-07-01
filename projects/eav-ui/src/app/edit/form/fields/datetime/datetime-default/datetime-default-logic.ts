import { FieldSettings } from '../../../../../../../../edit-types';
import { InputTypeConstants } from '../../../../../content-type-fields/constants/input-type.constants';
import { FieldLogicBase } from '../../../shared/field-logic/field-logic-base';
import { FieldLogicTools } from '../../../shared/field-logic/field-logic-tools';

const logThis = false;

export class DateTimeDefaultLogic extends FieldLogicBase {

  constructor() {
    super(InputTypeConstants.DateTimeDefault, logThis);
  }


  update(settings: FieldSettings, value: string[], tools: FieldLogicTools): FieldSettings {
    const l = this.log.fn('update', '', { settings, value, tools });
    const fixedSettings = settings;
    return l.r(fixedSettings);
  }
}

FieldLogicBase.add(DateTimeDefaultLogic);
