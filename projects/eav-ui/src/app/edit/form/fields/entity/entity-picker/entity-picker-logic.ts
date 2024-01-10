import { FieldSettings, UiPickerModeTree } from '../../../../../../../../edit-types';
import { InputTypeConstants } from '../../../../../content-type-fields/constants/input-type.constants';
import { EavAttributesDto } from '../../../../shared/models/json-format-v1';
import { FieldLogicBase } from '../../../shared/field-logic/field-logic-base';
import { FieldLogicTools } from '../../../shared/field-logic/field-logic-tools';
import { PickerConfigModels } from '../../picker/constants/picker-config-model.constants';

export class EntityPickerLogic extends FieldLogicBase {
  name = InputTypeConstants.WIPEntityPicker;

  update(settings: FieldSettings, value: string[], tools: FieldLogicTools): FieldSettings {
    const fs: FieldSettings = { ...settings };

    /** Entity Default logic */
    fs.EntityType ??= '';
    fs.AllowMultiValue ??= false;
    fs.EnableEdit ??= true;
    fs.EnableCreate ??= true;
    fs.EnableAddExisting ??= true;
    fs.EnableRemove ??= true;
    fs.EnableDelete ??= false;
    // 2dm 2023-01-22 #maybeSupportIncludeParentApps
    // fixedSettings.IncludeParentApps ??= false;

    fs.Information ??= '';
    fs.Tooltip ??= '';
    fs.Label ??= '';

    if (tools.eavConfig.overrideEditRestrictions && tools.debug) {
      // tslint:disable-next-line: max-line-length
      console.log('SystemAdmin + Debug: Overriding edit restrictions for field \'' + settings.Name + '\' (EntityType: \'' + settings.EntityType + '\').');
      fs.EnableEdit = true;
      fs.EnableCreate = true;
      fs.EnableAddExisting = true;
      fs.EnableRemove = true;
      fs.EnableDelete = true;
    }

    const dataSources = tools.contentTypeItemService.getContentTypeItems(fs.DataSources);
    // const dsAttributes = EavAttributesDto.attributesToDto(dataSources[0]?.Attributes);
    const dsAttributes = dataSources[0]?.Attributes;

    /** Query datasource */
    if (dataSources[0]?.Type.Name === PickerConfigModels.UiPickerSourceQuery) {
      fs.DataSourceType = PickerConfigModels.UiPickerSourceQuery;

      fs.Query = dsAttributes['Query'].Values[0].Value ?? '';
      fs.StreamName = dsAttributes['StreamName'].Values[0].Value ?? 'Default';
      fs.UrlParameters = dsAttributes['QueryParameters'].Values[0].Value ?? '';

      fs.Value = dsAttributes['Value'].Values[0].Value ?? '';
      fs.Label = dsAttributes['Label'].Values[0].Value ?? '';
      fs.EntityType = dsAttributes['CreateTypes'].Values[0].Value ?? '';

      fs.MoreFields = dsAttributes['MoreFields'].Values[0].Value ?? '';
    }

    /** Entity datasource */
    if (dataSources[0]?.Type.Name === PickerConfigModels.UiPickerSourceEntity) {
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
        TreeParentChildRefField: 'Children',
        TreeChildParentRefField: 'Parent',
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

FieldLogicBase.add(EntityPickerLogic);
