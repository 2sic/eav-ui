import { FieldSettings, UiPickerModeTree } from '../../../../../../../../edit-types';
import { InputTypeStrict, InputTypeConstants } from '../../../../../content-type-fields/constants/input-type.constants';
import { FieldLogicBase } from '../../../shared/field-logic/field-logic-base';
import { FieldLogicTools } from '../../../shared/field-logic/field-logic-tools';
import { PickerConfigModels } from '../../picker/constants/picker-config-model.constants';
import { calculateDropdownOptions } from './string-picker.helpers';

export class StringPickerLogic extends FieldLogicBase {
  name: InputTypeStrict = InputTypeConstants.WIPStringPicker;

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
    fs.EnableTextEntry ??= false;
    fs.Separator ??= '\\n';

    const dataSources = tools.contentTypeItemService.getContentTypeItems(fs.DataSources);
    const dsAttributes = dataSources[0]?.Attributes;

    /** Dropdown datasource */
    if (dataSources[0].Type.Name === PickerConfigModels.UiPickerSourceCustomList) {
      fs.DataSourceType = PickerConfigModels.UiPickerSourceCustomList;

      fs.DropdownValuesFormat ??= 'value-label'; //currently not defined nowhere in the config
      fs.DropdownValues = dsAttributes['Values'].Values[0].Value ?? '';
      fs._options = calculateDropdownOptions(value, 'string', fs.DropdownValuesFormat, fs.DropdownValues) ?? [];
    }

    /** Query datasource */
    if (dataSources[0].Type.Name === PickerConfigModels.UiPickerSourceQuery) {
      fs.DataSourceType = PickerConfigModels.UiPickerSourceQuery;

      fs.Query = dsAttributes['Query'].Values[0].Value ?? '';
      fs.StreamName = dsAttributes['StreamName'].Values[0].Value ?? 'Default';
      fs.UrlParameters = dsAttributes['QueryParameters'].Values[0].Value ?? '';

      fs.Value = dsAttributes['Value'].Values[0].Value ?? '';
      fs.Label = dsAttributes['Label'].Values[0].Value ?? '';
      fs.EntityType = dsAttributes['CreateTypes'].Values[0].Value ?? '';
    }

    /** Entity datasource */
    if (dataSources[0].Type.Name === PickerConfigModels.UiPickerSourceEntity) {
      fs.DataSourceType = PickerConfigModels.UiPickerSourceEntity;

      fs.EntityType = dsAttributes['ContentTypeNames'].Values[0].Value ?? '';
    }

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

    fs.PickerDisplayMode ??= 'list';
    fs.PickerDisplayConfiguration ??= [];

    if (fs.PickerDisplayMode === 'tree') {
      const pickerTreeConfiguration: UiPickerModeTree = {
        Title: 'Tree Picker Configuration',// nothing to implement
        ConfigModel: 'UiPickerModeTree',// nothing to implement
        TreeRelationship: 'child-parent',
        TreeBranchStream: 'Default',
        TreeLeavesStream: 'Default',
        TreeParentIdField: 'Id',
        TreeChildIdField: 'Id',
        TreeParentChildRefField: 'children',
        TreeChildParentRefField: 'parent',
        TreeShowRoot: true,
        TreeDepthMax: 10,
        TreeAllowSelectRoot: true,// implemented
        TreeAllowSelectBranch: true,// implemented
        TreeAllowSelectLeaves: true,// implemented
      };
      fs.PickerTreeConfiguration = pickerTreeConfiguration;
    }

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
