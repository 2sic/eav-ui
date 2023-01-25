/*
  **Important**
  This file is also used by the project edit-types.
  Because of this, it should never import anything other than types, because otherwise that project will have trouble compiling.

  We may also end up moving this type to there later on.
*/
import type { Editor, RawEditorOptions } from 'tinymce';
import { TinyEavConfig } from './tinymce-config';
export const TinyModeStandard = 'standard';
export const WysiwygInline = 'inline';
export const WysiwygDialog = 'dialog';
export const WysiwygDefault = 'default';
export const WysiwygModeText = 'text';
export const WysiwygModeMedia = 'media';
export const WysiwygAdvanced = 'advanced';
export type TinyModeNames = typeof TinyModeStandard | typeof WysiwygInline | typeof WysiwygAdvanced;

export type WysiwygEditMode = typeof WysiwygDefault | typeof WysiwygAdvanced| typeof WysiwygModeText | typeof WysiwygModeMedia | string;
export type WysiwygDisplayMode = typeof WysiwygInline | typeof WysiwygDialog;

export const WysiwygModeCycle: WysiwygEditMode[] = [
  WysiwygDefault,
  WysiwygModeText,
  WysiwygModeMedia
];

export interface RawEditorOptionsWithModes extends RawEditorOptions, Omit<TinyMceModeWithSwitcher, 'menubar' | 'toolbar' | 'contextmenu'> {
  eavConfig: TinyEavConfig;
}

export interface TinyMceMode {
  currentMode: {
    displayMode: WysiwygDisplayMode,
    editMode: WysiwygEditMode,
  };
  menubar: boolean | string; // should match TinyMCE
  toolbar: string | string[]; // should match TinyMCE
  contextmenu: string;
}


export interface TinyMceModeWithSwitcher extends TinyMceMode {
  modeSwitcher: ToolbarSwitcher;
}

export interface ToolbarSwitcher {
  // isDialog(editor: Editor): boolean;
  switch(displayMode: WysiwygDisplayMode, editMode: WysiwygEditMode): TinyMceMode;
}
