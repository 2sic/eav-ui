import { Of } from '../../../../../../../core';
import { FieldSettings } from '../../../../../../../edit-types/src/FieldSettings';
import { FieldSettingsPickerMerged, StringDropdown } from '../../../../../../../edit-types/src/FieldSettings-Pickers';
import { InputTypeCatalog } from '../../../../shared/fields/input-type-catalog';
import { FieldLogicBase, FieldLogicUpdate } from '../../logic/field-logic-base';
import { PickerLogicShared } from '../../picker/picker-logic-shared';
import { optionsAllowsEmpty } from '../../picker/picker.helpers';
import { calculateDropdownOptions } from '../string-picker/string-picker.helpers';

export class StringDropdownLogic extends FieldLogicBase {
  name: Of<typeof InputTypeCatalog> = InputTypeCatalog.StringDropdown;
  type: 'string' | 'number' = 'string';

  constructor() { super({ StringDropdownLogic }); }

  update({ settings, value }: FieldLogicUpdate<string>): FieldSettings {
    const fs = PickerLogicShared.setDefaultSettings({ ...settings }) as FieldSettings & StringDropdown & FieldSettingsPickerMerged;
    // fixedSettings.EnableTextEntry ??= false;
    // fixedSettings.DropdownValues ??= '';
    // fixedSettings.DropdownValuesFormat ??= '';// maybe we should change this to 'value-label' in the future
    fs._options = calculateDropdownOptions(value, this.type, fs.DropdownValuesFormat || '', fs.DropdownValues || '');
    fs._allowSelectingEmpty = optionsAllowsEmpty(fs._options);
    
    // Both the query type and create-type are the same
    fs.EntityType ??= '';
    fs.CreateTypes = fs.EntityType;

    fs.EnableEdit ??= false;
    fs.EnableCreate ??= false;
    // fixedSettings.EnableAddExisting ??= true;
    // fixedSettings.EnableDelete ??= false;
    // if multi-value is ever allowed, then we must also enable remove
    // since we're migrating to pickers, we don't plan to implement multi-value dropdowns here
    // fixedSettings.AllowMultiValue ??= false;
    fs.EnableRemove ??= fs.AllowMultiValue;
    return fs;
  }
}

FieldLogicBase.add(StringDropdownLogic);
