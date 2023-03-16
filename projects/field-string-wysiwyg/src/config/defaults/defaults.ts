import * as DialogModes from '../../constants/display-modes';
import { WysiwygConfigurationSet, WysiwygConfigurationVariation } from '../types/wysiwyg-configurations';
import { DefaultContextMenu } from './default-context-menu';
import { TinyMceOptionsDefault, TinyMceOptionsText, TinyMceOptionsTextBasic, TinyMceOptionsTextMinimal, TinyMceOptionsTextPlain } from './default-tinymce-options';
import { DefaultPlugins } from './default-tinymce-plugins';
import { DefaultToolbarConfig } from './default-toolbar-config';

/** Standard wysiwyg mode */
export const DefaultMode = 'default';

const VariationInline: WysiwygConfigurationVariation = {
  displayMode: DialogModes.DisplayInline,
  buttons: {
    source: false,
    advanced: false,
    dialog: true,
  }
};

const VariationDialog: WysiwygConfigurationVariation = {
  displayMode: DialogModes.DisplayDialog,
  buttons: {
    source: true,
    advanced: true,
    dialog: false,
  },
};

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
  tinyMceOptions: TinyMceOptionsDefault,
  tinyMcePlugins: DefaultPlugins,
  toolbar: DefaultToolbarConfig.default,
  variations: [
    VariationInline,
    VariationDialog,
  ],
};

const configurationText: WysiwygConfigurationSet = {
  ...defaultConfigurationSet,
  tinyMceOptions: TinyMceOptionsText,
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
    ...defaultConfigurationSet,
    variations: [
      VariationInline,
      {
        ...VariationDialog,
        toolbar: DefaultToolbarConfig.dialogDefault,
      },
    ],
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
    tinyMceOptions: TinyMceOptionsTextBasic,
    toolbar: DefaultToolbarConfig['text-basic'],
  },
  'text-minimal': {
    ...configurationText,
    editMode: 'text-minimal',
    tinyMceOptions: TinyMceOptionsTextMinimal,
    toolbar: DefaultToolbarConfig['text-minimal'],
  },
  'text-plain': {
    ...configurationText,
    editMode: 'text-plain',
    features: {
      ...configurationText.features,
      pasteFormatted: false,
      editInDialog: false,
    },
    tinyMceOptions: TinyMceOptionsTextPlain,
    toolbar: DefaultToolbarConfig['text-plain'],
  },
  rich: {
    ...defaultConfigurationSet,
    editMode: 'rich',
    tinyMceOptions: {
      ...TinyMceOptionsDefault,
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
