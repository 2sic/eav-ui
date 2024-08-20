import { FieldLogicUpdate, FieldLogicBase } from '../../logic/field-logic-base';
import { StringDropdownLogic } from '../string-dropdown/string-dropdown-logic';
import { InputTypeConstants } from '../../../../content-type-fields/constants/input-type.constants';
import { FieldSettings } from '../../../../../../../edit-types/src/FieldSettings';


export class NumberDropdownLogic extends StringDropdownLogic {
  name = InputTypeConstants.NumberDropdown;
  type = 'number' as 'number';

  update(specs: FieldLogicUpdate<string>): FieldSettings {
    const fixedSettings: FieldSettings = { ...super.update(specs) };
    // fixedSettings.DisableAutoTranslation = true;
    return fixedSettings;
  }
}

FieldLogicBase.add(NumberDropdownLogic);
