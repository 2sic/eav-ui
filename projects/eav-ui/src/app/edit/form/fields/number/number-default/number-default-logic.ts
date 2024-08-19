import { FieldSettings } from '../../../../../../../../edit-types';
import { InputTypeConstants } from '../../../../../content-type-fields/constants/input-type.constants';
import { FieldLogicBase, FieldLogicUpdate } from '../../../shared/field-logic/field-logic-base';
import { StringDropdownLogic } from '../../string/string-dropdown/string-dropdown-logic';

export class NumberDefaultLogic extends StringDropdownLogic {
  name = InputTypeConstants.NumberDefault;

  update(specs: FieldLogicUpdate<string>): FieldSettings {
    const fixedSettings: FieldSettings = { ...super.update(specs) };
    // fixedSettings.DisableAutoTranslation = true;
    return fixedSettings;
  }
}

FieldLogicBase.add(NumberDefaultLogic);
