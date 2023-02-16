import { InputTypeConstants } from '../../../../eav-ui/src/app/content-type-fields/constants/input-type.constants';
import { DefaultContextMenu } from './default-context-menu';
import { WysiwygConfiguration, WysiwygConfigurationSet } from '../types/wysiwyg-configurations';
import { DefaultOptions } from './default-tinymce-options';
import { DefaultPlugins } from './default-tinymce-plugins';
import { StringWysiwyg } from '../../../../edit-types/src/FieldSettings';
import { Connector } from 'projects/edit-types';
import { WysiwygFeatures, WysiwygButtons } from '../types';
import { consoleLogWebpack } from '../../../../field-custom-gps/src/shared/console-log-webpack.helper';
import { DefaultToolbarConfig } from './default-toolbar-config';
import { TinyMceToolbars } from '../toolbars';
import * as DialogModes from '../../constants/display-modes';
import * as EditModes from '../../constants/edit-modes';

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
  contextMenu: DefaultContextMenu.default,
  menubar: false,
  tinyMce: {
    options: DefaultOptions,
    plugins: DefaultPlugins,
  },
  tinyMceOptions: DefaultOptions,
  tinyMcePlugins: DefaultPlugins,
  toolbar: DefaultToolbarConfig.default,
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
      toolbar: DefaultToolbarConfig.dialogDefault,
    }
  ],
};

const configurationText: WysiwygConfigurationSet = {
  ...defaultConfigurationSet,
  editMode: 'text',
  contextMenu: DefaultContextMenu.text,
  toolbar: DefaultToolbarConfig.text,
}

const ConfigurationPresets: Record<string, WysiwygConfigurationSet> = {
  default: {
    ...defaultConfigurationSet
  },
  advanced: {
    ...defaultConfigurationSet,
    editMode: 'advanced',
    toolbar: DefaultToolbarConfig.advanced,
    menubar: true,
  },
  text: configurationText,
  'text-basic': {
    ...configurationText,
    editMode: 'text-basic',
    toolbar: DefaultToolbarConfig['text-basic'],
  },
  'text-minimal': {
    ...configurationText,
    editMode: 'text-minimal',
    toolbar: DefaultToolbarConfig['text-minimal'],
  },
  rich: {
    ...defaultConfigurationSet,
    editMode: 'rich',
    contextMenu: DefaultContextMenu.rich,
    features: {
      ...defaultConfigurationSet.features,
      responsiveImages: true,
      contentSeparators: true,
    },
    toolbar: DefaultToolbarConfig.rich,
  }
};

export class WysiwygConfigurationManager {

  constructor(
    private connector: Connector<string>,
    private fieldSettings: StringWysiwyg) {
  }

  current: WysiwygConfiguration;

  public getSettings(editMode: EditModes.WysiwygEditMode, displayMode: DialogModes.DisplayModes): WysiwygConfiguration {
    // 0. Shorten some variables
    const exp = this.connector._experimental;
    const fieldSettings = this.fieldSettings;

    // 1. Figure out the mode to use. This can be `text`, `rich` or `default`
    editMode = editMode || this.fieldSettings._advanced.Mode as string;

    // 2. Get the preset for this mode
    var preset = this.getPreset(editMode, displayMode);
    // console.error('preset', preset, 'editMode', editMode, 'displayMode', displayMode);
    editMode = preset.editMode;
    displayMode = preset.displayMode; // reset, in case it had to change / was not an available option

    // 2. Feature detection
    // contentBlocks is on if the following field can hold inner-content items
    const useContentBlocks = exp.allInputTypeNames[this.connector.field.index + 1]?.inputType === InputTypeConstants.EntityContentBlocks;
    const features: WysiwygFeatures = {
      ...preset.features,
      contentBlocks: useContentBlocks,
    };

    // 3. Buttons reconfiguration
    const buttons: WysiwygButtons = {
      // ...preset.buttons,
      source: nullOrBool(fieldSettings.ButtonSource) ?? preset.buttons.source,
      advanced: nullOrBool(fieldSettings.ButtonAdvanced) ?? preset.buttons.advanced,
      dialog: !fieldSettings.Dialog 
        ? preset.buttons.dialog // not set / empty - use default
        : fieldSettings.Dialog === DialogModes.DisplayInline, // set, activate if 'inline'
    };
    
    const wysiwygConfiguration = {
      ...preset,
      buttons,
      features,
    };

    // Build and attach the final toolbar
    const toolbar = new TinyMceToolbars().switch(wysiwygConfiguration);
    wysiwygConfiguration.tinyMce.toolbar = toolbar;

    this.current = wysiwygConfiguration;
    return wysiwygConfiguration;
  }

  public switch(editMode: EditModes.WysiwygEditMode, displayMode: DialogModes.DisplayModes) {
    // temp/wip - rebuild settings and toolbarMaker as sideEffect - this is not good
    const updated = this.getSettings(editMode, displayMode);
    return updated.tinyMce;
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
  consoleLogWebpack('2dm editMode', editMode, 'displayMode', displayMode, ConfigurationPresets);
  // Find best match for modeConfig, if not found, rename and use default
  const defConfig = ConfigurationPresets[DefaultMode];
  let currConfig = ConfigurationPresets[editMode];
  // console.warn('2dm currConfig', currConfig, 'defConfig', defConfig, 'editMode', editMode, 'displayMode', displayMode);
  if (!currConfig) {
    editMode = DefaultMode;
    currConfig = defConfig;
  }

  if (!currConfig)
    throw new Error(`Wysiwyg configuration mode '${editMode}' and '${DefaultMode}' not found.`);

  // Find best match for variation. If found, mix with defaults
  const variation = currConfig.variations.find(v => v.displayMode === displayMode);
  // consoleLogWebpack('2dm variationPartial', variation, 'currConfig', currConfig, 'defConfig', defConfig);
  const merged: WysiwygConfiguration = variation ? {
    editMode: currConfig.editMode || defConfig.editMode,
    displayMode: variation.displayMode || currConfig.displayMode || defConfig.displayMode,
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
    menubar: variation.menubar || currConfig.menubar || defConfig.menubar,
    tinyMce: null,
    tinyMceOptions: variation.tinyMceOptions || currConfig.tinyMceOptions || defConfig.tinyMceOptions,
    tinyMcePlugins: variation.tinyMcePlugins || currConfig.tinyMcePlugins || defConfig.tinyMcePlugins,
    toolbar: variation.toolbar || currConfig.toolbar || defConfig.toolbar,
  } : { ...currConfig };

  merged.tinyMce = {
    ...merged.tinyMceOptions,
    plugins: merged.tinyMcePlugins,
    contextmenu: merged.contextMenu[0],
    menubar: merged.menubar,
  };
  // consoleLogWebpack('2dm merged', merged);

  return merged;
}

function nullOrBool(value: string): boolean | null {
  return value == null || value.trim() === '' ? null : value.toLowerCase() === 'true';
}