import { FieldSettings, UiPickerModeTree, UiPickerSourceEntity, UiPickerSourceQuery } from '../../../../../../../../edit-types';
import { InputTypeConstants } from '../../../../../content-type-fields/constants/input-type.constants';
import { EavEntity } from '../../../../shared/models/eav';
import { FieldLogicBase } from '../../../shared/field-logic/field-logic-base';
import { FieldLogicTools } from '../../../shared/field-logic/field-logic-tools';
import { PickerConfigModels } from '../../picker/constants/picker-config-model.constants';

export class EntityPickerLogic extends FieldLogicBase {
  name = InputTypeConstants.WIPEntityPicker;

  update(settings: FieldSettings, value: string[], tools: FieldLogicTools): FieldSettings {
    let dataSources: EavEntity[] = [];
    let pickerDisplayConfigurations: EavEntity[] = [];
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

    if(fs.DataSources?.length > 0) 
      dataSources = tools.contentTypeItemService.getContentTypeItems(fs.DataSources);

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
    
    const pdcAttributes = pickerDisplayConfigurations[0]?.Attributes;

    if (pickerDisplayConfigurations[0]?.Type.Name === PickerConfigModels.UiPickerModeTree) {
      const pickerTreeConfiguration: UiPickerModeTree = {
        Title: pdcAttributes['Title'].Values[0].Value ?? '',
        ConfigModel: PickerConfigModels.UiPickerModeTree,
        TreeRelationship: pdcAttributes['TreeRelationship'].Values[0].Value ?? 'parent-child',
        TreeBranchesStream: pdcAttributes['TreeBranchesStream'].Values[0].Value ?? 'Default',
        TreeLeavesStream: pdcAttributes['TreeLeavesStream'].Values[0].Value ?? 'Default',
        TreeParentIdField: pdcAttributes['TreeParentIdField'].Values[0].Value ?? 'Id',
        TreeChildIdField: pdcAttributes['TreeChildIdField'].Values[0].Value ?? 'Id',
        TreeParentChildRefField: pdcAttributes['TreeParentChildRefField'].Values[0].Value ?? 'Children',
        TreeChildParentRefField: pdcAttributes['TreeChildParentRefField'].Values[0].Value ?? 'Parent',
        TreeShowRoot: pdcAttributes['TreeShowRoot'].Values[0].Value ?? true, 
        TreeDepthMax: pdcAttributes['TreeDepthMax'].Values[0].Value ?? 10,
        TreeAllowSelectRoot: pdcAttributes['TreeAllowSelectRoot'].Values[0].Value ?? true,
        TreeAllowSelectBranch: pdcAttributes['TreeAllowSelectBranch'].Values[0].Value ?? true,
        TreeAllowSelectLeaf: pdcAttributes['TreeAllowSelectLeaf'].Values[0].Value ?? true,
      };
      fs.PickerTreeConfiguration = pickerTreeConfiguration;
    }

    return fs;
  }
}

FieldLogicBase.add(EntityPickerLogic);
