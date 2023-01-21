/*
  **Important**
  This file is also used by the project edit-types.
  Because of this, it should never import anything other than types, because otherwise that project will have trouble compiling.

  We may also end up moving this type to there later on.
*/
import type { RawEditorOptions } from 'tinymce';
import { TinyEavConfig } from './tinymce-config';
export const TinyModeStandard = 'standard';
export const WysiwygInline = 'inline';
export const WysiwygDialog = 'dialog';
export const WysiwygDefault = 'default';
export const WysiwygModeText = 'text';
export const WysiwygModeMedia = 'media';
export const WysiwygAdvanced = 'advanced';
export type TinyModeNames = typeof TinyModeStandard | typeof WysiwygInline | typeof WysiwygAdvanced;

export type WysiwygMode = typeof WysiwygDefault | typeof WysiwygModeText | typeof WysiwygModeMedia | typeof WysiwygAdvanced;
export type WysiwygView = typeof WysiwygInline | typeof WysiwygDialog;

export const WysiwygModeCycle: WysiwygMode[] = [
  WysiwygDefault,
  WysiwygModeText,
  WysiwygModeMedia
];

export interface RawEditorOptionsWithModes extends RawEditorOptions, Omit<TinyMceModeWithSwitcher, 'menubar' | 'toolbar' | 'contextmenu'> {
  eavConfig: TinyEavConfig;
}

export interface TinyMceMode {
  currentMode: {
    view: WysiwygView,
    mode: WysiwygMode,
  };
  menubar: boolean | string; // should match TinyMCE
  toolbar: string | string[]; // should match TinyMCE
  contextmenu: string;
}


export interface TinyMceModeWithSwitcher extends TinyMceMode {
  modeSwitcher: ToolbarSwitcher;
}

export interface ToolbarSwitcher {
  switch(view: WysiwygView, mode: WysiwygMode): TinyMceMode;
}
