import { FieldSettings } from '../../../../../../../../edit-types';
import { InputTypeStrict, InputTypeConstants } from '../../../../../content-type-fields/constants/input-type.constants';
import { FieldLogicBase } from '../../../shared/field-logic/field-logic-base';
import { calculateDropdownOptions } from '../string-picker/string-picker.helpers';

export class StringDropdownLogic extends FieldLogicBase {
  name: InputTypeStrict = InputTypeConstants.StringDropdown;
  type: 'string' | 'number' = 'string';

  update(settings: FieldSettings, value: string): FieldSettings {
    const fixedSettings: FieldSettings = { ...settings };
    fixedSettings.EnableTextEntry ??= false;
    fixedSettings.DropdownValues ??= '';
    fixedSettings.DropdownValuesFormat ??= '';// maybe we should change this to 'value-label' in the future
    fixedSettings._options = calculateDropdownOptions(value, this.type, fixedSettings.DropdownValuesFormat, fixedSettings.DropdownValues);
    fixedSettings.EntityType ??= '';
    fixedSettings.CreateTypes = fixedSettings.EntityType;
    fixedSettings.EnableEdit ??= false;
    fixedSettings.EnableCreate ??= false;
    fixedSettings.EnableAddExisting ??= true;
    fixedSettings.EnableDelete ??= false;
    // if multi-value is ever allowed, then we must also enable remove
    // since we're migrating to pickers, we don't plan to implement multi-value dropdowns here
    fixedSettings.AllowMultiValue ??= false;
    fixedSettings.EnableRemove ??= fixedSettings.AllowMultiValue;
    return fixedSettings;
  }
}

FieldLogicBase.add(StringDropdownLogic);
