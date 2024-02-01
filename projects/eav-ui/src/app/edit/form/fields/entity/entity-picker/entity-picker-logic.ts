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
    fs.AllowMultiValue ??= false;
    fs.EnableEdit ??= true;
    fs.EnableCreate ??= true;
    fs.EnableAddExisting ??= true;
    fs.EnableRemove ??= true;
    fs.EnableDelete ??= false;
    // 2dm 2023-01-22 #maybeSupportIncludeParentApps
    // fixedSettings.IncludeParentApps ??= false;

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
      fs.StreamName = uiPickerSourceQuery.StreamName ?? 'Default';// stream name could be multiple stream names
      fs.UrlParameters = uiPickerSourceQuery.QueryParameters ?? '';

      fs.Value = uiPickerSourceQuery.Value ?? '';
      fs.Label = uiPickerSourceQuery.Label ?? '';
      fs.CreateTypes = uiPickerSourceQuery.CreateTypes ?? '';// possible multiple types

      fs.MoreFields = uiPickerSourceQuery.MoreFields ?? '';

      fs.ItemInformation = uiPickerSourceQuery.ItemInformation ?? '';
      fs.ItemTooltip = uiPickerSourceQuery.ItemTooltip ?? '';
      fs.ItemHelpLink = uiPickerSourceQuery.ItemHelpLink ?? '';
    }

    /** Entity datasource */
    if (dataSources[0]?.Type.Name === PickerConfigModels.UiPickerSourceEntity) {
      fs.DataSourceType = PickerConfigModels.UiPickerSourceEntity;
      const uiPickerSourceEntity = tools.entityReader.flatten(dataSources[0]) as UiPickerSourceEntity;

      fs.EntityType = uiPickerSourceEntity.ContentTypeNames ?? '';// possible multiple types
      fs.CreateTypes = uiPickerSourceEntity.CreateTypes ?? '';// possible multiple types
      fs.MoreFields = uiPickerSourceEntity.MoreFields ?? '';

      fs.ItemInformation = uiPickerSourceEntity.ItemInformation ?? '';
      fs.ItemTooltip = uiPickerSourceEntity.ItemTooltip ?? '';
      fs.ItemHelpLink = uiPickerSourceEntity.ItemHelpLink ?? '';
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

FieldLogicBase.add(EntityPickerLogic);
