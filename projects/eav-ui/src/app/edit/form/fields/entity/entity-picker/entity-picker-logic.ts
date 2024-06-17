import { FieldSettings, RelationshipParentChild, UiPickerModeTree, UiPickerSourceEntity, UiPickerSourceEntityAndQuery, UiPickerSourceQuery } from '../../../../../../../../edit-types';
import { InputTypeConstants } from '../../../../../content-type-fields/constants/input-type.constants';
import { EavEntity } from '../../../../shared/models/eav';
import { FieldLogicBase } from '../../../shared/field-logic/field-logic-base';
import { FieldLogicTools } from '../../../shared/field-logic/field-logic-tools';
import { PickerConfigModels } from '../../picker/constants/picker-config-model.constants';
import { EntityDefaultLogic } from '../entity-default/entity-default-logic';

export class EntityPickerLogic extends FieldLogicBase {
  name = InputTypeConstants.EntityPicker;

  update(settings: FieldSettings, value: string[], tools: FieldLogicTools): FieldSettings {
    let dataSources: EavEntity[] = [];
    let pickerDisplayConfigurations: EavEntity[] = [];
    
    const fs = EntityDefaultLogic.setDefaultSettings({ ...settings });

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

    // Transfer configuration
    const dataSource = dataSources[0];
    const sourceIsQuery = dataSource?.Type.Name === PickerConfigModels.UiPickerSourceQuery;
    const sourceIsEntity = dataSource?.Type.Name === PickerConfigModels.UiPickerSourceEntity;
    // DataSource may not be configured yet, in which case the object is just {}
    const specs = tools.entityReader.flatten<UiPickerSourceEntityAndQuery>(dataSource);
    
    // Properties to transfer from both query and entity
    if (sourceIsEntity || sourceIsQuery) {
      fs.CreateTypes = specs.CreateTypes ?? '';// possible multiple types
      fs.MoreFields = specs.MoreFields ?? '';
      fs.Label = specs.Label ?? '';
      fs.ItemInformation = specs.ItemInformation ?? '';
      fs.ItemTooltip = specs.ItemTooltip ?? '';
      fs.ItemLink = specs.ItemLink ?? '';
    }

    /** Query datasource */
    if (sourceIsQuery) {
      fs.DataSourceType = PickerConfigModels.UiPickerSourceQuery;

      const specsQuery = specs as UiPickerSourceQuery;
      fs.Query = specsQuery.Query ?? '';
      fs.StreamName = specsQuery.StreamName ?? 'Default';// stream name could be multiple stream names
      fs.UrlParameters = specsQuery.QueryParameters ?? '';

      // The Query may specify another value to be used as the value (but it's unlikely)
      fs.Value = specsQuery.Value ?? '';
    }

    /** Entity datasource */
    if (sourceIsEntity) {
      fs.DataSourceType = PickerConfigModels.UiPickerSourceEntity;

      const specsEntity = specs as UiPickerSourceEntity;
      fs.EntityType = specsEntity.ContentTypeNames ?? '';// possible multiple types
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
      const specsTree = tools.entityReader.flatten(pickerDisplayConfigurations[0]) as UiPickerModeTree;
      const pickerTreeConfiguration: UiPickerModeTree = {
        Title: specsTree.Title ?? '',
        ConfigModel: PickerConfigModels.UiPickerModeTree,
        TreeRelationship: specsTree.TreeRelationship ?? RelationshipParentChild,
        TreeBranchesStream: specsTree.TreeBranchesStream ?? 'Default',
        TreeLeavesStream: specsTree.TreeLeavesStream ?? 'Default',
        TreeParentIdField: specsTree.TreeParentIdField ?? 'Id',
        TreeChildIdField: specsTree.TreeChildIdField ?? 'Id',
        TreeParentChildRefField: specsTree.TreeParentChildRefField ?? 'Children',
        TreeChildParentRefField: specsTree.TreeChildParentRefField ?? 'Parent',
        TreeShowRoot: specsTree.TreeShowRoot ?? true, 
        TreeDepthMax: specsTree.TreeDepthMax ?? 10,
        TreeAllowSelectRoot: specsTree.TreeAllowSelectRoot ?? true,
        TreeAllowSelectBranch: specsTree.TreeAllowSelectBranch ?? true,
        TreeAllowSelectLeaf: specsTree.TreeAllowSelectLeaf ?? true,
      };
      fs.PickerTreeConfiguration = pickerTreeConfiguration;
    }

    return fs;
  }
}

FieldLogicBase.add(EntityPickerLogic);
