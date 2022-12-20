import { FieldSettings } from '../../../../../../../../edit-types';
import { InputTypeConstants } from '../../../../../content-type-fields/constants/input-type.constants';
import { FieldLogicBase } from '../../../shared/field-logic/field-logic-base';
import { StringDropdownLogic } from '../../string/string-dropdown/string-dropdown-logic';

export class NumberDefaultLogic extends StringDropdownLogic {
  name = InputTypeConstants.NumberDefault;

  update(settings: FieldSettings, value: string): FieldSettings {
    const fixedSettings: FieldSettings = { ...super.update(settings, value) };
    // fixedSettings.DisableAutoTranslation = true;
    return fixedSettings;
  }
}

FieldLogicBase.add(NumberDefaultLogic);
