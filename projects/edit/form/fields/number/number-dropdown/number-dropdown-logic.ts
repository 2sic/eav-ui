import { FieldSettings } from '../../../../../edit-types';
import { InputTypeConstants } from '../../../../../ng-dialogs/src/app/content-type-fields/constants/input-type.constants';
import { FieldLogicBase } from '../../../shared/field-logic/field-logic-base';
import { StringDropdownLogic } from '../../string/string-dropdown/string-dropdown-logic';

export class NumberDropdownLogic extends StringDropdownLogic {
  name = InputTypeConstants.NumberDropdown;
  type = 'number' as 'number';

  update(settings: FieldSettings, value: string): FieldSettings {
    const fixedSettings: FieldSettings = { ...super.update(settings, value) };
    return fixedSettings;
  }
}

FieldLogicBase.add(NumberDropdownLogic);
