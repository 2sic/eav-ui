import { FieldSettings } from '../../../../../../../../edit-types';
import { InputTypeConstants } from '../../../../../content-type-fields/constants/input-type.constants';
import { FieldLogicBase, FieldLogicUpdate } from '../../../shared/field-logic/field-logic-base';
import { StringDropdownLogic } from '../../string/string-dropdown/string-dropdown-logic';

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
