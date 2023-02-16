import { InputTypeConstants } from '../../../../eav-ui/src/app/content-type-fields/constants/input-type.constants';
import { DefaultContextMenu } from './default-context-menu';
import { WysiwygConfiguration, WysiwygConfigurationSet } from './wysiwyg-configuration-types';
import { DefaultOptions } from './default-tinymce-options';
import { DefaultPlugins } from './default-tinymce-plugins';
import { StringWysiwyg } from '../../../../edit-types/src/FieldSettings';
import { Connector } from 'projects/edit-types';
import { TinyEavFeatures, TinyEavButtons } from '../tinymce-config';
import { DisplayInline, DisplayModes } from '../../constants/display-modes';
import { consoleLogWebpack } from '../../../../field-custom-gps/src/shared/console-log-webpack.helper';
import { DefaultToolbarConfig } from './default-toolbar-config';

const debug = true;

const DefaultMode = 'default';

const defaultConfigurationSet: WysiwygConfigurationSet = {
  editMode: DefaultMode,
  buttons: {
    source: false,
    advanced: false,
    dialog: false,
  },
  features: {
    contentBlocks: false,
    responsiveImages: false,
    contentSeparators: false,
  },
  contextMenu: DefaultContextMenu.all.default as string[],
  tinyMceOptions: DefaultOptions,
  tinyMcePlugins: DefaultPlugins,
  toolbar: DefaultToolbarConfig.all.default as string[],
  variations: [
    {
      displayMode: 'inline',
      buttons: {
        source: false,
        advanced: false,
        dialog: true,
      }
    },
    {
      displayMode: 'dialog',
      buttons: {
        source: true,
        advanced: true,
        dialog: false,
      },
      toolbar: DefaultToolbarConfig.all.dialog as string[],
    }
  ],
};

const configurationText: WysiwygConfigurationSet = {
  ...defaultConfigurationSet,
  editMode: 'text',
  contextMenu: DefaultContextMenu.all.text as string[],
  toolbar: DefaultToolbarConfig.all.text as string[],
}

const ConfigurationPresets: Record<string, WysiwygConfigurationSet> = {
  default: {
    ...defaultConfigurationSet
  },
  advanced: {
    ...defaultConfigurationSet,
    toolbar: DefaultToolbarConfig.all.advanced as string[],
  },
  text: configurationText,
  'text-basic': {
    ...configurationText,
    toolbar: DefaultToolbarConfig.all['text-basic'] as string[],
  },
  'text-minimal': {
    ...configurationText,
    toolbar: DefaultToolbarConfig.all['text-minimal'] as string[],
  },
  rich: {
    ...defaultConfigurationSet,
    editMode: 'rich',
    contextMenu: DefaultContextMenu.all.rich as string[],
    features: {
      ...defaultConfigurationSet.features,
      responsiveImages: true,
      contentSeparators: true,
    },
    toolbar: DefaultToolbarConfig.all.rich as string[],
  }
};

export class WysiwygConfigurationManager {
  //#region Constructor and Singleton
  private readonly _configurations: Record<string, WysiwygConfigurationSet>;

  private constructor() {
    this._configurations = ConfigurationPresets;
  }

  public static singleton(): WysiwygConfigurationManager {
    if (!this._singleton) this._singleton = new WysiwygConfigurationManager();
    return this._singleton;
  }
  private static _singleton: WysiwygConfigurationManager;
  //#endregion

  public getSettings(connector: Connector<string>, fieldSettings: StringWysiwyg, displayMode: DisplayModes): WysiwygConfiguration {
    // 0. Shorten some variables
    const exp = connector._experimental;

    // 1. Figure out the mode to use. This can be `text`, `rich` or `default`
    let editMode = fieldSettings._advanced.Mode as string;

    // 2. Get the preset for this mode
    var preset = this.getPreset(editMode, displayMode);
    editMode = preset.editMode;

    // 2. Feature detection
    // contentBlocks is on if the following field can hold inner-content items
    const useContentBlocks = exp.allInputTypeNames[connector.field.index + 1]?.inputType === InputTypeConstants.EntityContentBlocks;
    const features: TinyEavFeatures = {
      ...preset.features,
      contentBlocks: useContentBlocks,
    };

    // 3. Buttons reconfiguration
    const bSource = nullOrBool(fieldSettings.ButtonSource);
    const bAdvanced = nullOrBool(fieldSettings.ButtonAdvanced);
    const buttons: TinyEavButtons = {
      ...preset.buttons,
      source: bSource ?? preset.buttons.source,
      advanced: bAdvanced ?? preset.buttons.advanced,
    };
    
    return {
      ...preset,
      buttons,
      features,
    };
  }

  public getPreset(mode: string, displayMode: string): WysiwygConfiguration {
    try {
      return getPresetInternal(mode, displayMode);
    } catch (e) {
      // if anything fails, error and return the default configuration
      console.error(e);
      return ConfigurationPresets.default;
    }
    
  }
}

function getPresetInternal(editMode: string, displayMode: string): WysiwygConfiguration {
  // Find best match for modeConfig, if not found, rename and use default
  let modeConfig = ConfigurationPresets[editMode];
  if (!modeConfig) {
    editMode = DefaultMode;
    modeConfig = ConfigurationPresets[DefaultMode];
  }

  if (!modeConfig)
    throw new Error(`Wysiwyg configuration mode '${editMode}' and '${DefaultMode}' not found.`);

  // Find best match for variation. If found, mix with defaults
  const variationPartial = modeConfig.variations.find(v => v.displayMode === displayMode);
  consoleLogWebpack('2dm variationPartial', variationPartial);
  const merged: WysiwygConfiguration = variationPartial ? {
    // ...modeConfig,
    editMode: variationPartial.editMode || modeConfig.editMode,
    buttons: {
      ...modeConfig.buttons,
      ...variationPartial.buttons,
    },
    contextMenu: variationPartial.contextMenu || modeConfig.contextMenu,
    features: {
      ...modeConfig.features,
      ...variationPartial.features,
    },
    tinyMceOptions: variationPartial.tinyMceOptions || modeConfig.tinyMceOptions,
    tinyMcePlugins: variationPartial.tinyMcePlugins || modeConfig.tinyMcePlugins,
    toolbar: variationPartial.toolbar || modeConfig.toolbar,
  } : modeConfig;
  consoleLogWebpack('2dm merged', merged);

  return merged;
  // {
  //   editMode: editMode,
  //   buttons: variation?.buttons || modeConfig.buttons,
  //   contextMenu: variation?.contextMenu || modeConfig.contextMenu,
  //   features: variation?.features || modeConfig.features,
  //   tinyMceOptions: variation?.tinyMceOptions || modeConfig.tinyMceOptions,
  //   tinyMcePlugins: variation?.tinyMcePlugins || modeConfig.tinyMcePlugins
  // };
}

function nullOrBool(value: string): boolean | null {
  return value == null ? null : value.toLowerCase() === 'true';
}