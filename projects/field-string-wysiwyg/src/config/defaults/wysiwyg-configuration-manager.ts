import { InputTypeConstants } from '../../../../eav-ui/src/app/content-type-fields/constants/input-type.constants';
import { DefaultContextMenu } from './default-context-menu';
import { WysiwygConfiguration, WysiwygConfigurationSet } from './wysiwyg-configuration-types';
import { DefaultOptions } from './default-tinymce-options';
import { DefaultPlugins } from './default-tinymce-plugins';
import { StringWysiwyg } from '../../../../edit-types/src/FieldSettings';
import { Connector } from 'projects/edit-types';
import { TinyEavFeatures, TinyEavButtons, TinyEavConfig } from '../tinymce-config';
import { consoleLogWebpack } from '../../../../field-custom-gps/src/shared/console-log-webpack.helper';
import { DefaultToolbarConfig } from './default-toolbar-config';
import { toConfigForViewModes } from '../config-for-view-modes';
import { TinyMceToolbars } from '../toolbars';
import * as DialogModes from '../../constants/display-modes';
import * as EditModes from '../../constants/edit-modes';
import { TinyMceMode } from '../tinymce-helper-types';

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
  tinyMce: {
    options: DefaultOptions,
    plugins: DefaultPlugins,
  },
  tinyMceOptions: DefaultOptions,
  tinyMcePlugins: DefaultPlugins,
  toolbar: DefaultToolbarConfig.all.default as string[],
  variations: [
    {
      displayMode: DialogModes.DisplayInline,
      buttons: {
        source: false,
        advanced: false,
        dialog: true,
      }
    },
    {
      displayMode: DialogModes.DisplayDialog,
      buttons: {
        source: true,
        advanced: true,
        dialog: false,
      },
      toolbar: DefaultToolbarConfig.all.dialog as string[],
      contextMenu: ['link image'], // experimental
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

  constructor(
    private connector: Connector<string>,
    private fieldSettings: StringWysiwyg) {
  }

  toolbarMaker: TinyMceToolbars;
  eavConfigTemp: TinyEavConfig;

  current: WysiwygConfiguration;

  public getSettings(displayMode: DialogModes.DisplayModes): WysiwygConfiguration {
    // 0. Shorten some variables
    const exp = this.connector._experimental;
    const fieldSettings = this.fieldSettings;

    // 1. Figure out the mode to use. This can be `text`, `rich` or `default`
    let editMode = this.fieldSettings._advanced.Mode as string;

    // 2. Get the preset for this mode
    var preset = this.getPreset(editMode, displayMode);
    editMode = preset.editMode;

    // 2. Feature detection
    // contentBlocks is on if the following field can hold inner-content items
    const useContentBlocks = exp.allInputTypeNames[this.connector.field.index + 1]?.inputType === InputTypeConstants.EntityContentBlocks;
    const features: TinyEavFeatures = {
      ...preset.features,
      contentBlocks: useContentBlocks,
    };

    // 3. Buttons reconfiguration
    const buttons: TinyEavButtons = {
      ...preset.buttons,
      source: nullOrBool(fieldSettings.ButtonSource) ?? preset.buttons.source,
      advanced: nullOrBool(fieldSettings.ButtonAdvanced) ?? preset.buttons.advanced,
    };
    
    const wysiwygConfiguration = {
      ...preset,
      buttons,
      features,
    };

    // WIP
    const bSource = fieldSettings.ButtonSource?.toLowerCase();
    const bAdvanced = fieldSettings.ButtonAdvanced?.toLowerCase();
    const bToDialog = fieldSettings.Dialog === DialogModes.DisplayInline;

    consoleLogWebpack('2dm fieldSettings', fieldSettings);
    const eavConfig: TinyEavConfig = {
      mode: toConfigForViewModes(wysiwygConfiguration.editMode),
      features: wysiwygConfiguration.features,
      buttons: {
        inline: {
          source: bSource === 'true',
          advanced: bAdvanced === 'true',
          dialog: bToDialog,
        },
        dialog: {
          source: bSource !== 'false',
          advanced: bAdvanced !== 'false',
          dialog: false,
        }
      }
    };
    consoleLogWebpack('2dm eavConfig', eavConfig);
    this.eavConfigTemp = eavConfig;
    this.toolbarMaker = new TinyMceToolbars(eavConfig);

    this.current = wysiwygConfiguration;
    return wysiwygConfiguration;
  }

  public switch(editMode: EditModes.WysiwygEditMode, displayMode: DialogModes.DisplayModes)
  : TinyMceMode & { contextmenu: string } {
    this.getSettings(displayMode);
    return { 
      ...this.toolbarMaker.switch(displayMode, editMode),
      contextmenu: this.current.contextMenu[0],
    };
  }

  public getPreset(editMode: EditModes.WysiwygEditMode, displayMode: DialogModes.DisplayModes): WysiwygConfiguration {
    try {
      return getPresetInternal(editMode, displayMode);
    } catch (e) {
      // if anything fails, error and return the default configuration
      console.error(e);
      return ConfigurationPresets.default;
    }
    
  }
}

function getPresetInternal(editMode: EditModes.WysiwygEditMode, displayMode: DialogModes.DisplayModes): WysiwygConfiguration {
  consoleLogWebpack('2dm editMode', editMode, 'displayMode', displayMode);
  // Find best match for modeConfig, if not found, rename and use default
  const defConfig = ConfigurationPresets[DefaultMode];
  let currConfig = ConfigurationPresets[editMode];
  if (!currConfig) {
    editMode = DefaultMode;
    currConfig = defConfig;
  }

  if (!currConfig)
    throw new Error(`Wysiwyg configuration mode '${editMode}' and '${DefaultMode}' not found.`);

  // Find best match for variation. If found, mix with defaults
  const variation = currConfig.variations.find(v => v.displayMode === displayMode);
  consoleLogWebpack('2dm variationPartial', variation, 'currConfig', currConfig, 'defConfig', defConfig);
  const merged: WysiwygConfiguration = variation ? {
    editMode: variation.editMode || currConfig.editMode || defConfig.editMode,
    buttons: {
      ...defConfig.buttons,
      ...currConfig.buttons,
      ...variation.buttons,
    },
    contextMenu: variation.contextMenu || currConfig.contextMenu || defConfig.contextMenu,
    features: {
      ...defConfig.features,
      ...currConfig.features,
      ...variation.features,
    },
    tinyMce: null,
    tinyMceOptions: variation.tinyMceOptions || currConfig.tinyMceOptions || defConfig.tinyMceOptions,
    tinyMcePlugins: variation.tinyMcePlugins || currConfig.tinyMcePlugins || defConfig.tinyMcePlugins,
    toolbar: variation.toolbar || currConfig.toolbar || defConfig.toolbar,
  } : { ...currConfig };

  merged.tinyMce = {
    ...merged.tinyMceOptions,
    plugins: merged.tinyMcePlugins,
    contextmenu: merged.contextMenu[0],
  };
  consoleLogWebpack('2dm merged', merged);

  return merged;
}

function nullOrBool(value: string): boolean | null {
  return value == null ? null : value.toLowerCase() === 'true';
}