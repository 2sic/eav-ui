import { FieldSettings } from '../../../../../edit-types';
// tslint:disable-next-line:max-line-length
import { InputTypeConstant, InputTypeConstants } from '../../../../../ng-dialogs/src/app/content-type-fields/constants/input-type.constants';
import { FieldLogicBase } from '../../../shared/field-logic/field-logic-base';
import { calculateDropdownOptions } from './string-dropdown.helpers';

export class StringDropdownLogic extends FieldLogicBase {
  name: InputTypeConstant = InputTypeConstants.StringDropdown;
  type: 'string' | 'number' = 'string';

  update(settings: FieldSettings, value: string): FieldSettings {
    const fixedSettings: FieldSettings = { ...settings };
    fixedSettings.EnableTextEntry ??= false;
    fixedSettings.DropdownValues ??= '';
    fixedSettings.DropdownValuesFormat ??= '';
    fixedSettings._options = calculateDropdownOptions(value, this.type, fixedSettings.DropdownValuesFormat, fixedSettings.DropdownValues);
    return fixedSettings;
  }
}

FieldLogicBase.add(StringDropdownLogic);
