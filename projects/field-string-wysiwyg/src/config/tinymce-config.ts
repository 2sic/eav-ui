import { WysiwygMode, WysiwygView } from './tinymce-helper-types';

export interface SelectSettings {
  mode: WysiwygMode;
  view: WysiwygView;
  buttons: TinyEavButtons;
  features: TinyEavFeatures;
}

export interface TinyEavFeatures {
  contentBlocks: boolean,
  wysiwygEnhanced: boolean,
}

export interface TinyEavButtons {
  source: boolean;
  advanced: boolean;
  dialog: boolean;
  contentDivisions: boolean;
}
export interface TinyEavConfig {
  features: TinyEavFeatures;

  buttons: Record<WysiwygView, TinyEavButtons>;
}


// This is stil WIP for 2dm - would be the JSON that comes from the field configuration
export interface TinyMceModeConfigJson extends TinyEavConfig {
  /** The foundation for filling in the configuration */
  inherits?: WysiwygMode;
  contextmenu?: string;
  toolbar?: string | string[];
}


/**
 * Goal is to have a class which contains all the settings
 * which affect how the toolbars etc. are made.
 *
 * This is so that we can place our default values here,
 * but then allow field configuration to replace it.
 *
 * ...but still just pass one object to all the helper functions,
 * ...and keep things simple as more configs are added.
 */
export type TinyMceConfigJson = Record<WysiwygMode, TinyMceModeConfigJson>;
