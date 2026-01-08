import { Of } from '../../../../../../core';
import { FieldSettings } from '../../../../../../edit-types/src/FieldSettings';
import { FieldSettingsEntity, FieldSettingsPicker, FieldSettingsPickerMerged } from '../../../../../../edit-types/src/FieldSettings-Pickers';
import { FieldValue } from '../../../../../../edit-types/src/FieldValue';
import { RelationshipParentChild, UiPickerModeTree } from '../../../../../../edit-types/src/PickerModeTree';
import { FieldSettingsWithPickerSource, PickerSourceCustomCsv, PickerSourceCustomList, PickerSourceEntity, PickerSourceQuery, UiPickerSourcesAll } from '../../../../../../edit-types/src/PickerSources';
import { FeatureNames } from '../../../features/feature-names';
import { classLog } from '../../../shared/logging';
import { EavEntity } from '../../shared/models/eav';
import { DataSourceDropDownOptions } from '../basic/string-picker/string-picker.helpers';
import { FieldLogicTools } from '../logic/field-logic-tools';
import { FieldSettingsUpdateTask } from '../logic/field-settings-update-task';
import { PickerConfigs, PickerSourcesCustom, UiPickerModeIsTree } from './constants/picker-config-model.constants';
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
    const s = settings as FieldSettings & FieldSettingsPickerMerged;
    s.AllowMultiValue ??= false;
    s.EnableEdit ??= true;
    s.EnableCreate ??= true;
    s.EnableAddExisting ??= true;
    // if multi-value is ever allowed, then we must also enable remove...
    s.EnableRemove ??= true;
    s.EnableDelete ??= false;
    s.Label ??= '';
    s.EnableTextEntry ??= false;

    s.noAutoFocus = true;

    return s;
  }

  static maybeOverrideEditRestrictions(fsUntyped: FieldSettings, tools: FieldLogicTools): { fs: FieldSettings, removeEditRestrictions: boolean } {
    const fs = fsUntyped as FieldSettings & FieldSettingsPickerMerged;
    if (!(tools.eavConfig.removeEditRestrictions && tools.debug))
      return { fs, removeEditRestrictions: false };

    console.log(`SystemAdmin + Debug: Overriding edit restrictions for field \'${fs.Name}\' (EntityType: \'${fs.EntityType}\').`);
    fs.EnableEdit = true;
    fs.EnableCreate = true;
    fs.EnableAddExisting = true;
    fs.EnableRemove = true;
    fs.EnableDelete = true;
    return { fs, removeEditRestrictions: true };
  }

  preUpdate({ settings, tools, value }: FieldSettingsUpdateTask) {

    const fsDefaults = PickerLogicShared.setDefaultSettings({ ...settings });

    const { fs: fsRaw, removeEditRestrictions } = PickerLogicShared.maybeOverrideEditRestrictions(fsDefaults, tools);

    const { fs, typeConfig } = new PickerLogicShared().#getDataSourceAndSetupFieldSettings(value, fsRaw, tools);

    return { fs, removeEditRestrictions, typeConfig };
  }


  #getDataSourceAndSetupFieldSettings(value: FieldValue, fsBasic: FieldSettings, tools: FieldLogicTools) {
    // Define field settings to be a merged FieldSettings and PickerSources
    const fs = fsBasic as FieldSettingsWithPickerSource & FieldSettingsPickerMerged;

    const dataSources: EavEntity[] = (fs.DataSources?.length > 0)
      ? tools.contentTypeItemSvc.getMany(fs.DataSources)
      : [];

    // Transfer configuration
    const dataSource = dataSources[0];
    const typeName = dataSource?.Type.Name as Of<typeof PickerConfigs>;
    fs.dataSourceType = typeName ?? '' as Of<typeof PickerConfigs>;

    // DataSource may not be configured yet, in which case the object is just {}
    const typeConfig = tools.reader.flatten<UiPickerSourcesAll>(dataSource);

    const isKnownType = Object.values(PickerConfigs).includes(typeName);

    const l = this.log.fn('dataSources', { dataSources });

    l.values({ typeName, isKnownType, dataSources, typeConfig });

    if (!isKnownType) {
      console.error(`Unknown picker source type: '${typeName}' on field ${fs.Name}`);
      return { fs, typeConfig };
    }

    // Properties to transfer from just about all sources
    fs.CreateTypes = typeConfig.CreateTypes ?? '';// possible multiple types
    fs.MoreFields = typeConfig.MoreFields ?? '';
    fs.Label = typeConfig.Label ?? '';
    fs.ItemInformation = typeConfig.ItemInformation ?? '';
    fs.ItemTooltip = typeConfig.ItemTooltip ?? '';
    fs.ItemLink = typeConfig.ItemLink ?? '';
    fs.PreviewType = typeConfig.PreviewType ?? '';

    // May specify another value to be used as the value - eg. for strings/numbers
    fs.Value = typeConfig.Value ?? '';

    // Do this for all, as it's a common property - e.g. Css, AppAssets, etc.
    fs.PreviewValue = typeConfig.PreviewValue ?? '';

    const sourceIsQuery = typeName === PickerConfigs.UiPickerSourceQuery;
    const sourceIsEntity = typeName === PickerConfigs.UiPickerSourceEntity;
    const sourceIsCss = typeName === PickerConfigs.UiPickerSourceCss;
    const sourceIsAppAssets = typeName === PickerConfigs.UiPickerSourceAppAssets;

    l.values({ sourceIsQuery, sourceIsEntity, sourceIsCss, sourceIsAppAssets });

    const isCustomSource = Object.values(PickerSourcesCustom).includes(typeName as Of<typeof PickerSourcesCustom>);

    /** Query Data Source */
    if (sourceIsQuery) {
      const specsQuery = typeConfig as PickerSourceQuery;
      fs.Query = specsQuery.Query ?? '';
      fs.StreamName = specsQuery.StreamName ?? 'Default';// stream name could be multiple stream names
      fs.UrlParameters = specsQuery.QueryParameters ?? '';
    }

    /** Entity Data Source */
    if (sourceIsEntity) {
      const specsEntity = typeConfig as PickerSourceEntity;
      (fs as FieldSettingsEntity).EntityType = specsEntity.ContentTypeNames ?? '';// possible multiple types
    }

    /** Css File Data Source */
    if (sourceIsCss) {
      fs.CssSourceFile = typeConfig.CssSourceFile ?? '';
      fs.CssSelectorFilter = typeConfig.CssSelectorFilter ?? '';
    }

    /** App Assets Source */
    if (sourceIsAppAssets) {
      fs.AssetsRootFolder = typeConfig.AssetsRootFolder ?? '/';
      fs.AssetsFileFilter = typeConfig.AssetsFileFilter ?? '*.*';
      fs.AssetsType = typeConfig.AssetsType ?? 'files';
      fs.requiredFeatures = [FeatureNames.PickerSourceAppAssets];
    }

    if (isCustomSource) {
      if (typeName === PickerConfigs.UiPickerSourceCustomList) {
        const valuesRaw = (typeConfig as UiPickerSourcesAll & PickerSourceCustomList).Values ?? '';
        // note that 'value-label' is the only format supported by the new picker config
        fs._options ??= new DataSourceDropDownOptions().parseOptions(value as string, 'string', 'value-label', valuesRaw) ?? [];
      } else if (typeName === PickerConfigs.UiPickerSourceCustomCsv) {
        const csv = (typeConfig as UiPickerSourcesAll & PickerSourceCustomCsv).Csv;
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
  #getTreeConfigOnce(fs: FieldSettings & FieldSettingsPicker, tools: FieldLogicTools): UiPickerModeTree {
    if (fs.PickerTreeConfiguration)
      return fs.PickerTreeConfiguration;

    if (fs.PickerDisplayMode !== 'tree')
      return null;

    // Tree configuration WIP
    const pickerDisplayConfigurations: EavEntity[] = (fs.PickerDisplayConfiguration?.length > 0)
      ? tools.contentTypeItemSvc.getMany(fs.PickerDisplayConfiguration)
      : [];

    const pickerDisplayConfigName = pickerDisplayConfigurations[0]?.Type.Name;

    if (pickerDisplayConfigName !== UiPickerModeIsTree)
      return null;

    const specs = tools.reader.flatten<UiPickerModeTree>(pickerDisplayConfigurations[0]);
    const final: UiPickerModeTree = {
      Title: specs.Title ?? '',
      ConfigModel: UiPickerModeIsTree,
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
