import { FieldSettings, UiPickerModeTree, UiPickerSourceCustomList, UiPickerSourceEntity, UiPickerSourceQuery } from '../../../../../../../../edit-types';
import { InputTypeStrict, InputTypeConstants } from '../../../../../content-type-fields/constants/input-type.constants';
import { EavEntity } from '../../../../shared/models/eav';
import { FieldLogicBase } from '../../../shared/field-logic/field-logic-base';
import { FieldLogicTools } from '../../../shared/field-logic/field-logic-tools';
import { PickerConfigModels } from '../../picker/constants/picker-config-model.constants';
import { calculateDropdownOptions } from './string-picker.helpers';

export class StringPickerLogic extends FieldLogicBase {
  name: InputTypeStrict = InputTypeConstants.WIPStringPicker;

  update(settings: FieldSettings, value: string, tools: FieldLogicTools): FieldSettings {
    let dataSources: EavEntity[] = [];
    let pickerDisplayConfigurations: EavEntity[] = [];
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

    if (fs.DataSources?.length > 0)
      dataSources = tools.contentTypeItemService.getContentTypeItems(fs.DataSources);

    /** Dropdown datasource */
    if (dataSources[0]?.Type.Name === PickerConfigModels.UiPickerSourceCustomList) {
      fs.DataSourceType = PickerConfigModels.UiPickerSourceCustomList;
      const uiPickerSourceCustomList = tools.entityReader.flatten(dataSources[0]) as UiPickerSourceCustomList;

      fs.DropdownValuesFormat ??= 'value-label'; //currently not defined nowhere in the config
      fs.DropdownValues = uiPickerSourceCustomList.Values ?? '';
      fs._options = calculateDropdownOptions(value, 'string', fs.DropdownValuesFormat, fs.DropdownValues) ?? [];
    }

    /** Query datasource */
    if (dataSources[0]?.Type.Name === PickerConfigModels.UiPickerSourceQuery) {
      fs.DataSourceType = PickerConfigModels.UiPickerSourceQuery;
      const uiPickerSourceQuery = tools.entityReader.flatten(dataSources[0]) as UiPickerSourceQuery;

      fs.Query = uiPickerSourceQuery.Query ?? '';
      fs.StreamName = uiPickerSourceQuery.StreamName ?? 'Default';
      fs.UrlParameters = uiPickerSourceQuery.QueryParameters ?? '';

      fs.Value = uiPickerSourceQuery.Value ?? '';
      fs.Label = uiPickerSourceQuery.Label ?? '';
      fs.EntityType = uiPickerSourceQuery.CreateTypes ?? '';

      fs.MoreFields = uiPickerSourceQuery.MoreFields ?? '';
    }

    /** Entity datasource */
    if (dataSources[0]?.Type.Name === PickerConfigModels.UiPickerSourceEntity) {
      fs.DataSourceType = PickerConfigModels.UiPickerSourceEntity;
      const uiPickerSourceEntity = tools.entityReader.flatten(dataSources[0]) as UiPickerSourceEntity;

      fs.EntityType = uiPickerSourceEntity.ContentTypeNames ?? '';
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

    if (fs.PickerDisplayConfiguration?.length > 0)
      pickerDisplayConfigurations = tools.contentTypeItemService.getContentTypeItems(fs.PickerDisplayConfiguration);

    if (pickerDisplayConfigurations[0]?.Type.Name === PickerConfigModels.UiPickerModeTree) {
      const uiPickerModeTree = tools.entityReader.flatten(pickerDisplayConfigurations[0]) as UiPickerModeTree;
      const pickerTreeConfiguration: UiPickerModeTree = {
        Title: uiPickerModeTree.Title ?? '',
        ConfigModel: PickerConfigModels.UiPickerModeTree,
        TreeRelationship: uiPickerModeTree.TreeRelationship ?? 'parent-child',
        TreeBranchesStream: uiPickerModeTree.TreeBranchesStream ?? 'Default',
        TreeLeavesStream: uiPickerModeTree.TreeLeavesStream ?? 'Default',
        TreeParentIdField: uiPickerModeTree.TreeParentIdField ?? 'Id',
        TreeChildIdField: uiPickerModeTree.TreeChildIdField ?? 'Id',
        TreeParentChildRefField: uiPickerModeTree.TreeParentChildRefField ?? 'Children',
        TreeChildParentRefField: uiPickerModeTree.TreeChildParentRefField ?? 'Parent',
        TreeShowRoot: uiPickerModeTree.TreeShowRoot ?? true,
        TreeDepthMax: uiPickerModeTree.TreeDepthMax ?? 10,
        TreeAllowSelectRoot: uiPickerModeTree.TreeAllowSelectRoot ?? true,
        TreeAllowSelectBranch: uiPickerModeTree.TreeAllowSelectBranch ?? true,
        TreeAllowSelectLeaf: uiPickerModeTree.TreeAllowSelectLeaf ?? true,
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
