import { FieldValue } from 'projects/edit-types';
import { FieldSettings, RelationshipParentChild, UiPickerModeTree, UiPickerSourceCss, UiPickerSourceCustomCsv, UiPickerSourceCustomList, UiPickerSourceEntity, UiPickerSourceEntityAndQuery, UiPickerSourceQuery } from '../../../../../../edit-types/src/FieldSettings';
import { Of } from '../../../core';
import { FeatureNames } from '../../../features/feature-names';
import { classLog } from '../../../shared/logging';
import { EavEntity } from '../../shared/models/eav';
import { calculateDropdownOptions } from '../basic/string-picker/string-picker.helpers';
import { FieldLogicUpdate } from '../logic/field-logic-base';
import { FieldLogicTools } from '../logic/field-logic-tools';
import { PickerConfigs, PickerSourcesCustom } from './constants/picker-config-model.constants';
import { DataSourceParserCsv } from './data-sources/data-source-parser-csv';

const logSpecs = {
  all: true,
  getDataSourceAndSetupFieldSettings: true,
  data: true,
};

export class PickerLogicShared {

  log = classLog({ PickerLogicShared }, logSpecs);

  constructor() { }

  static setDefaultSettings(settings: FieldSettings): FieldSettings {
    settings.AllowMultiValue ??= false;
    settings.EnableEdit ??= true;
    settings.EnableCreate ??= true;
    settings.EnableAddExisting ??= true;
    // if multi-value is ever allowed, then we must also enable remove...
    settings.EnableRemove ??= true;
    settings.EnableDelete ??= false;
    settings.Label ??= '';
    settings.isDialog ??= false;
    settings.EnableTextEntry ??= false;
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

  preUpdate({ settings, tools, value }: FieldLogicUpdate) {

    const fsDefaults = PickerLogicShared.setDefaultSettings({ ...settings });

    const { fs: fsRaw, overriding } = PickerLogicShared.maybeOverrideEditRestrictions(fsDefaults, tools);

    const { fs, typeConfig } = new PickerLogicShared().#getDataSourceAndSetupFieldSettings(value, fsRaw, tools);

    return { fs, overriding, typeConfig };
  }


  #getDataSourceAndSetupFieldSettings(value: FieldValue, fs: FieldSettings, tools: FieldLogicTools) {
    const dataSources: EavEntity[] = (fs.DataSources?.length > 0)
      ? tools.contentTypeItemSvc.getMany(fs.DataSources)
      : [];

    fs.noAutoFocus = true;

    // Transfer configuration
    const dataSource = dataSources[0];
    const typeName = dataSource?.Type.Name as Of<typeof PickerConfigs>;
    fs.DataSourceType = typeName ?? '' as Of<typeof PickerConfigs>;

    // DataSource may not be configured yet, in which case the object is just {}
    const typeConfig = tools.reader.flatten<UiPickerSourceEntityAndQuery>(dataSource);

    const isKnownType = Object.values(PickerConfigs).includes(typeName);

    const l = this.log.fn('dataSources', { dataSources });

    l.values({ typeName, isKnownType, dataSources, typeConfig });

    if (!isKnownType) {
      console.error(`Unknown picker source type: ${typeName}`);
      return { fs, typeConfig };
    }

    // Properties to transfer from both query and entity
    fs.CreateTypes = typeConfig.CreateTypes ?? '';// possible multiple types
    fs.MoreFields = typeConfig.MoreFields ?? '';
    fs.Label = typeConfig.Label ?? '';
    fs.ItemInformation = typeConfig.ItemInformation ?? '';
    fs.ItemTooltip = typeConfig.ItemTooltip ?? '';
    fs.ItemLink = typeConfig.ItemLink ?? '';

    const sourceIsQuery = typeName === PickerConfigs.UiPickerSourceQuery;
    const sourceIsEntity = typeName === PickerConfigs.UiPickerSourceEntity;
    const sourceIsCss = typeName === PickerConfigs.UiPickerSourceCss;

    l.values({ sourceIsQuery, sourceIsEntity, sourceIsCss });

    const isCustomSource = Object.values(PickerSourcesCustom).includes(typeName as Of<typeof PickerSourcesCustom>);

    /** Query Data Source */
    if (sourceIsQuery) {
      const specsQuery = typeConfig as UiPickerSourceQuery;
      fs.Query = specsQuery.Query ?? '';
      fs.StreamName = specsQuery.StreamName ?? 'Default';// stream name could be multiple stream names
      fs.UrlParameters = specsQuery.QueryParameters ?? '';

      // The Query may specify another value to be used as the value (but it's unlikely)
      fs.Value = specsQuery.Value ?? '';
    }

    /** Entity Data Source */
    if (sourceIsEntity) {
      const specsEntity = typeConfig as UiPickerSourceEntity;
      fs.EntityType = specsEntity.ContentTypeNames ?? '';// possible multiple types
    }

    /** Css File Data Source */
    if (sourceIsCss) {
      const specsCss = typeConfig as UiPickerSourceCss;
      fs.CssSourceFile = specsCss.CssSourceFile ?? '';
      fs.CssSelectorFilter = specsCss.CssSelectorFilter ?? '';
      fs.Value = specsCss.Value ?? '';
      fs.PreviewValue = specsCss.PreviewValue ?? '';
      fs.PickerPreviewType = specsCss.PickerPreviewType ?? '';
    }

    if (isCustomSource) {
      if (typeName === PickerConfigs.UiPickerSourceCustomList) {
        const valuesRaw = (typeConfig as unknown as UiPickerSourceCustomList).Values ?? '';
        // note that 'value-label' is the only format supported by the new picker config
        fs._options ??= calculateDropdownOptions(value as string, 'string', 'value-label', valuesRaw) ?? [];
      } else if (typeName === PickerConfigs.UiPickerSourceCustomCsv) {
        // TODO: THIS should of course also be possible in Entity Pickers
        const csv = (typeConfig as unknown as UiPickerSourceCustomCsv).Csv;
        fs._options ??= new DataSourceParserCsv().parse(csv);
        fs.requiredFeatures = [FeatureNames.PickerSourceCsv];
      }

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
    fs.PickerTreeConfiguration = this.#getTreeConfigOnce(fs, tools);

    return { fs, typeConfig };
  }

  /** Get the tree config, unless it was already created, in which case we reuse it. */
  #getTreeConfigOnce(fs: FieldSettings, tools: FieldLogicTools): UiPickerModeTree {
    if (fs.PickerTreeConfiguration)
      return fs.PickerTreeConfiguration;

    if (fs.PickerDisplayMode !== 'tree')
      return null;

    // Tree configuration WIP
    const pickerDisplayConfigurations: EavEntity[] = (fs.PickerDisplayConfiguration?.length > 0)
      ? tools.contentTypeItemSvc.getMany(fs.PickerDisplayConfiguration)
      : [];

    const pickerDisplayConfigName = pickerDisplayConfigurations[0]?.Type.Name;

    if (pickerDisplayConfigName !== PickerConfigs.UiPickerModeTree)
      return null;

    const specs = tools.reader.flatten(pickerDisplayConfigurations[0]) as UiPickerModeTree;
    const final: UiPickerModeTree = {
      Title: specs.Title ?? '',
      ConfigModel: PickerConfigs.UiPickerModeTree,
      TreeRelationship: specs.TreeRelationship ?? RelationshipParentChild,
      TreeBranchesStream: specs.TreeBranchesStream ?? 'Default',
      TreeLeavesStream: specs.TreeLeavesStream ?? 'Default',
      TreeParentIdField: specs.TreeParentIdField ?? 'Id',
      TreeChildIdField: specs.TreeChildIdField ?? 'Id',
      TreeParentChildRefField: specs.TreeParentChildRefField ?? 'Children',
      TreeChildParentRefField: specs.TreeChildParentRefField ?? 'Parent',
      TreeShowRoot: specs.TreeShowRoot ?? true,
      TreeDepthMax: specs.TreeDepthMax ?? 10,
      TreeAllowSelectRoot: specs.TreeAllowSelectRoot ?? true,
      TreeAllowSelectBranch: specs.TreeAllowSelectBranch ?? true,
      TreeAllowSelectLeaf: specs.TreeAllowSelectLeaf ?? true,
    } satisfies UiPickerModeTree;
    return final;
  }

}
