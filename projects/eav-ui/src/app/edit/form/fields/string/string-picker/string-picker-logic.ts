import { FieldSettings } from '../../../../../../../../edit-types';
import { InputTypeStrict, InputTypeConstants } from '../../../../../content-type-fields/constants/input-type.constants';
import { FieldLogicBase } from '../../../shared/field-logic/field-logic-base';
import { FieldLogicTools } from '../../../shared/field-logic/field-logic-tools';
import { calculateDropdownOptions } from './string-picker.helpers';

export class StringPickerLogic extends FieldLogicBase {
  name: InputTypeStrict = InputTypeConstants.WIPStringPicker;
  type: 'string' | 'number' = 'string';

  update(settings: FieldSettings, value: string, tools: FieldLogicTools): FieldSettings {
    const fs: FieldSettings = { ...settings };

    // fixedSettings.EnableTextEntry ??= false;
    // fixedSettings.DropdownValues ??= '';
    // fixedSettings.DropdownValuesFormat ??= 'value-label';// maybe we should change this to 'value-label' in the future
    // fixedSettings._options = calculateDropdownOptions(value, this.type, fixedSettings.DropdownValuesFormat, fixedSettings.DropdownValues);
    // fixedSettings.EntityType ??= '';
    // fixedSettings.AllowMultiValue ??= false;
    // fixedSettings.EnableEdit ??= false;
    // fixedSettings.EnableCreate ??= false;
    // fixedSettings.EnableAddExisting ??= true;
    // fixedSettings.EnableRemove ??= fixedSettings.AllowMultiValue; //if multi-value is allowed, then we can remove, if not we can't
    // fixedSettings.EnableDelete ??= false;

    fs.AllowMultiValue ??= false;
    fs.DataSources ??= [];
    fs.AllowMultiValue ??= false;
    fs.EnableEdit ??= false;
    fs.EnableCreate ??= false;
    fs.EnableAddExisting ??= true;
    fs.EnableRemove ??= fs.AllowMultiValue; //if multi-value is allowed, then we can remove, if not we can't
    fs.EnableDelete ??= false;

    const dataSources = tools.contentTypeItemService.getContentTypeItems(fs.DataSources);

    fs.DropdownValuesFormat ??= 'value-label';
    fs.DropdownValues = dataSources[0]?.Attributes['Values'].Values[0].Value;
    fs._options = calculateDropdownOptions(value, this.type, fs.DropdownValuesFormat, fs.DropdownValues);
    fs.Separator ??= '\\n';
    
    /** WIP functionalities */
    // If AllowMultiValue is false then EnableReselect must be false
    fs.AllowMultiValue ? fs.EnableReselect ??= false : fs.EnableReselect = false;
    // If AllowMultiValue is false then AllowMultiMin and AllowMultiMax must be 0 so we don't trigger the validation
    if (fs.AllowMultiValue) {
      fs.AllowMultiMin ??= 0;
      fs.AllowMultiMax ??= 0;
    } else {
      fs.AllowMultiMin = 0;
      fs.AllowMultiMax = 0;
    }

    console.log('SDV StringPickerLogic', fs);

    return fs;
  }
}

FieldLogicBase.add(StringPickerLogic);

// {
//   "DropdownValues": "",
//   "InputType": "string-picker",
//   "CreateParameters": "",
//   "CreatePrefill": "",
//   "EditParameters": "",
//   "PickerDisplayMode": "list",
//   "Separator": "\\n",
//   "DataSources": [
//     "b7013ebf-744d-4170-a101-b9602d203360"
//     ],
//   "PickerDisplayConfiguration": [],
//   "AllowMultiValue": false,
//   "EnableAddExisting": true,
//   "EnableCreate": true,
//   "EnableEdit": true,
//   "EnableRemove": true,
//   "EnableReselect": false,
//   "EnableTextEntry": false,
//   "CustomJavaScript": "",
//   "DefaultValue": "",
//   "Information": "",
//   "Name": "StringDropdown",
//   "Notes": "<p>This is a new configuration string picker dropdown</p>",
//   "Placeholder": "",
//   "Tooltip": "",
//   "ValidationRegExJavaScript": "",
//   "HelpLink": "",
//   "Errors": [],
//   "Formulas": [],
//   "Warnings": [],
//   "Disabled": false,
//   "DisableTranslation": false,
//   "Required": true,
//   "VisibleDisabled": false,
//   "Visible": true,
//   "DisableAutoTranslation": true,
//   "_disabledBecauseOfTranslation": false,
//   "ForcedDisabled": false
// }
