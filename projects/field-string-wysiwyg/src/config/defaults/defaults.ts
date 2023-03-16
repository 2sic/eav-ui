import * as DialogModes from '../../constants/display-modes';
import { WysiwygConfigurationSet } from '../types/wysiwyg-configurations';
import { DefaultContextMenu } from './default-context-menu';
import { DefaultOptions } from './default-tinymce-options';
import { DefaultPlugins } from './default-tinymce-plugins';
import { DefaultToolbarConfig } from './default-toolbar-config';


export const DefaultMode = 'default';

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
    contentSplitters: false,
    pasteFormatted: true,
    addImages: true,
    editInDialog: true,
  },
  contextMenu: DefaultContextMenu.default,
  menubar: false,
  tinyMce: null,  // this is set at runtime
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
  features: {
    ...defaultConfigurationSet.features,
    addImages: false,
  },
  editMode: 'text',
  contextMenu: DefaultContextMenu.text,
  toolbar: DefaultToolbarConfig.text,
};

export const ConfigurationPresets: Record<string, WysiwygConfigurationSet> = {
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
  'text-plain': {
    ...configurationText,
    features: {
      ...configurationText.features,
      pasteFormatted: false,
      editInDialog: false,
    },
    editMode: 'text-plain',
    toolbar: DefaultToolbarConfig['text-plain'],
  },
  rich: {
    ...defaultConfigurationSet,
    editMode: 'rich',
    tinyMceOptions: {
      ...DefaultOptions,
      // in rich mode, images should not be inside P-Tags
      // so that they can be floated and that p-tags can be beside the image
      valid_children: '-p[img]',
    },
    contextMenu: DefaultContextMenu.rich,
    features: {
      ...defaultConfigurationSet.features,
      responsiveImages: true,
      contentSplitters: true,
    },
    toolbar: DefaultToolbarConfig.rich,
  }
};
