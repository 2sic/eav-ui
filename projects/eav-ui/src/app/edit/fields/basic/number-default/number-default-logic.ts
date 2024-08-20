import { FieldLogicUpdate, FieldLogicBase } from '../../logic/field-logic-base';
import { StringDropdownLogic } from '../string-dropdown/string-dropdown-logic';
import { InputTypeConstants } from '../../../../content-type-fields/constants/input-type.constants';
import { FieldSettings } from '../../../../../../../edit-types/src/FieldSettings';


export class NumberDefaultLogic extends StringDropdownLogic {
  name = InputTypeConstants.NumberDefault;

  update(specs: FieldLogicUpdate<string>): FieldSettings {
    const fixedSettings: FieldSettings = { ...super.update(specs) };
    // fixedSettings.DisableAutoTranslation = true;
    return fixedSettings;
  }
}

FieldLogicBase.add(NumberDefaultLogic);
