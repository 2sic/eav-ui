import { ConfigForDisplayModes, ConfigForDisplayModesRaw } from './config-for-view-modes';
import { WysiwygDisplayMode, WysiwygEditMode } from './tinymce-helper-types';

export interface SelectSettings {
  /** The mode like 'default', 'text', etc. */
  editMode: WysiwygEditMode;
  /** inline / dialog */
  displayMode: WysiwygDisplayMode;
  /** What buttons are enabled by configuration */
  buttons: TinyEavButtons;
  /** which features are currently enabled */
  features: TinyEavFeatures;
}

export interface TinyEavFeatures {
  contentBlocks: boolean;
  wysiwygEnhanced: boolean;
  responsiveImages: boolean;
  contentSeparators: boolean;
}

export interface TinyEavButtons {
  source: boolean;
  advanced: boolean;
  dialog: boolean;
  contentDivisions: boolean;
}
export interface TinyEavConfig {
  mode: ConfigForDisplayModes<WysiwygEditMode>;
  features: TinyEavFeatures;
  buttons: ConfigForDisplayModes<TinyEavButtons>;
}
// TODO: this is not well designed yet, as the final form isn't decided
// Still WIP 2023-01-23 2dm
// Naming is still unclear too
export interface TinyEavConfigRaw {
  features: TinyEavFeatures;
  buttons: ConfigForDisplayModesRaw<TinyEavButtons>;
}

// This is still WIP for 2dm - would be the JSON that comes from the field configuration
export interface TinyMceModeConfigJson extends TinyEavConfig {
  /** The foundation for filling in the configuration */
  inherits?: WysiwygEditMode;
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
export type TinyMceConfigJson = Record<WysiwygEditMode, TinyMceModeConfigJson>;
