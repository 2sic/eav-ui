import * as DialogModes from '../constants/display-modes';
import * as EditModes from '../constants/edit-modes';
import { ConfigForDisplayModes, ConfigForDisplayModesRaw } from './config-for-view-modes';

export interface SelectSettings {
  /** The mode like 'default', 'text', etc. */
  editMode: EditModes.WysiwygEditMode;
  /** inline / dialog */
  displayMode: DialogModes.DisplayModes;
  /** What buttons are enabled by configuration */
  buttons: TinyEavButtons;
  /** which features are currently enabled */
  features: TinyEavFeatures;
}

export interface TinyEavFeatures {
  contentBlocks: boolean;
  // wysiwygEnhanced: boolean;
  responsiveImages: boolean;
  contentSeparators: boolean;
}

export interface TinyEavButtons {
  source: boolean;
  advanced: boolean;
  dialog: boolean;
}
export interface TinyEavConfig {
  mode: ConfigForDisplayModes<EditModes.WysiwygEditMode>;
  features: TinyEavFeatures;
  buttons: ConfigForDisplayModes<TinyEavButtons>;
}
