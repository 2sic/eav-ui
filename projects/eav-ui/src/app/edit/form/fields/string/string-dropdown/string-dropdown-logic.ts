import { FieldSettings } from '../../../../../../../../edit-types';
import { InputTypeStrict, InputTypeConstants } from '../../../../../content-type-fields/constants/input-type.constants';
import { FieldLogicBase } from '../../../shared/field-logic/field-logic-base';
import { calculateDropdownOptions } from './string-dropdown.helpers';

export class StringDropdownLogic extends FieldLogicBase {
  name: InputTypeStrict = InputTypeConstants.StringDropdown;
  type: 'string' | 'number' = 'string';

  update(settings: FieldSettings, value: string): FieldSettings {
    const fixedSettings: FieldSettings = { ...settings };
    // fixedSettings.EnableTextEntry ??= false;
    // fixedSettings.DropdownValues ??= '';
    // fixedSettings.DropdownValuesFormat ??= '';
    fixedSettings._options = calculateDropdownOptions(value, this.type, fixedSettings.DropdownValuesFormat, fixedSettings.DropdownValues);
    fixedSettings.EntityType ??= '';
    fixedSettings.AllowMultiValue ??= false;
    fixedSettings.EnableEdit ??= false;
    fixedSettings.EnableCreate ??= false;
    fixedSettings.EnableAddExisting ??= true;
    fixedSettings.EnableRemove ??= false;
    fixedSettings.EnableDelete ??= false;
    return fixedSettings;
  }
}

FieldLogicBase.add(StringDropdownLogic);
