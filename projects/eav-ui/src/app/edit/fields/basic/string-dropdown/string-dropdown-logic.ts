import { FieldLogicBase, FieldLogicUpdate } from '../../logic/field-logic-base';
import { calculateDropdownOptions } from '../string-picker/string-picker.helpers';
import { FieldSettings } from '../../../../../../../edit-types/src/FieldSettings';
import { InputTypeCatalog, InputTypeStrict } from '../../../../shared/fields/input-type-catalog';

export class StringDropdownLogic extends FieldLogicBase {
  name: InputTypeStrict = InputTypeCatalog.StringDropdown;
  type: 'string' | 'number' = 'string';

  update({ settings, value }: FieldLogicUpdate<string>): FieldSettings {
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
