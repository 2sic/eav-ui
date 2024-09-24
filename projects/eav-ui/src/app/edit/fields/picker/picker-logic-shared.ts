import { FieldSettings, RelationshipParentChild, UiPickerModeTree, UiPickerSourceEntity, UiPickerSourceEntityAndQuery, UiPickerSourceQuery } from '../../../../../../edit-types/src/FieldSettings';
import { Of } from '../../../core';
import { EavEntity } from '../../shared/models/eav';
import { FieldLogicUpdate } from '../logic/field-logic-base';
import { FieldLogicTools } from '../logic/field-logic-tools';
import { PickerConfigs } from './constants/picker-config-model.constants';


export class PickerLogicShared {
  
  constructor() { }

  static setDefaultSettings(settings: FieldSettings): FieldSettings {
    settings.AllowMultiValue ??= false;
    settings.EnableEdit ??= true;
    settings.EnableCreate ??= true;
    settings.EnableAddExisting ??= true;
    settings.EnableRemove ??= true;
    settings.EnableDelete ??= false;
    settings.Label ??= '';
    settings.isDialog ??= false;
    return settings;
  }

  static maybeOverrideEditRestrictions(fs: FieldSettings, tools: FieldLogicTools): { fs: FieldSettings, overriding: boolean } {
    if (!(tools.eavConfig.overrideEditRestrictions && tools.debug))
      return { fs, overriding: false };

    console.log(`SystemAdmin + Debug: Overriding edit restrictions for field \'${fs.Name}\' (EntityType: \'${fs.EntityType}\').`);
    fs.EnableEdit = true;
    fs.EnableCreate = true;
    fs.EnableAddExisting = true;
    fs.EnableRemove = true;
    fs.EnableDelete = true;
    return { fs, overriding: true };
  }

  preUpdate({ settings, tools }: FieldLogicUpdate) {
   
    const fsDefaults = PickerLogicShared.setDefaultSettings({ ...settings });

    const { fs: fsRaw, overriding } = PickerLogicShared.maybeOverrideEditRestrictions(fsDefaults, tools);

    const { fs, dataSourceTypeName, typeConfig } = new PickerLogicShared().getDataSourceAndSetupFieldSettings(fsRaw, tools);

    return { fs, overriding, dataSourceTypeName, typeConfig };
  }


  getDataSourceAndSetupFieldSettings(fs: FieldSettings, tools: FieldLogicTools) {
    const dataSources: EavEntity[] = (fs.DataSources?.length > 0)
      ? tools.contentTypeItemSvc.getMany(fs.DataSources)
      : [];

    // Transfer configuration
    const dataSource = dataSources[0];
    const dataSourceTypeName = dataSource?.Type.Name as Of<typeof PickerConfigs>;

    // DataSource may not be configured yet, in which case the object is just {}
    const typeConfig = tools.reader.flatten<UiPickerSourceEntityAndQuery>(dataSource);

    const isKnownType = Object.values(PickerConfigs).includes(dataSourceTypeName);

    if (!isKnownType) {
      console.error(`Unknown picker source type: ${dataSourceTypeName}`);
      return { fs, dataSourceTypeName, typeConfig };
    }

    fs.DataSourceType = dataSourceTypeName;

    // Properties to transfer from both query and entity
    fs.CreateTypes = typeConfig.CreateTypes ?? '';// possible multiple types
    fs.MoreFields = typeConfig.MoreFields ?? '';
    fs.Label = typeConfig.Label ?? '';
    fs.ItemInformation = typeConfig.ItemInformation ?? '';
    fs.ItemTooltip = typeConfig.ItemTooltip ?? '';
    fs.ItemLink = typeConfig.ItemLink ?? '';

    const sourceIsQuery = dataSourceTypeName === PickerConfigs.UiPickerSourceQuery;
    const sourceIsEntity = dataSourceTypeName === PickerConfigs.UiPickerSourceEntity;
    /** Query datasource */
    if (sourceIsQuery) {
      const specsQuery = typeConfig as UiPickerSourceQuery;
      fs.Query = specsQuery.Query ?? '';
      fs.StreamName = specsQuery.StreamName ?? 'Default';// stream name could be multiple stream names
      fs.UrlParameters = specsQuery.QueryParameters ?? '';

      // The Query may specify another value to be used as the value (but it's unlikely)
      fs.Value = specsQuery.Value ?? '';
    }

    /** Entity datasource */
    if (sourceIsEntity) {
      const specsEntity = typeConfig as UiPickerSourceEntity;
      fs.EntityType = specsEntity.ContentTypeNames ?? '';// possible multiple types
    }

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

    // Display Mode and configuration of that
    fs.PickerDisplayMode ??= 'list';
    fs.PickerDisplayConfiguration ??= [];

    // Tree configuration WIP
    const pickerDisplayConfigurations: EavEntity[] = (fs.PickerDisplayConfiguration?.length > 0)
      ? tools.contentTypeItemSvc.getMany(fs.PickerDisplayConfiguration)
      : [];

    const pickerDisplayConfigName = pickerDisplayConfigurations[0]?.Type.Name;

    if (pickerDisplayConfigName === PickerConfigs.UiPickerModeTree) {
      const specsTree = tools.reader.flatten(pickerDisplayConfigurations[0]) as UiPickerModeTree;
      const pickerTreeConfiguration: UiPickerModeTree = {
        Title: specsTree.Title ?? '',
        ConfigModel: PickerConfigs.UiPickerModeTree,
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


    return { fs, dataSourceTypeName, typeConfig };
  }
}