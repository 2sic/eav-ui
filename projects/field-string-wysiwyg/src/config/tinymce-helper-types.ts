/*
  **Important**
  This file is also used by the project edit-types.
  Because of this, it should never import anything other than types, because otherwise that project will have trouble compiling.

  We may also end up moving this type to there later on.
*/
import type { RawEditorOptions } from 'tinymce';
export const TinyModeStandard = 'standard';
export const WysiwygInline = 'inline';
export const WysiwygDialog = 'dialog';
export const WysiwygDefault = 'default';
export const WysiwygAdvanced = 'advanced';
export type TinyModeNames = typeof TinyModeStandard | typeof WysiwygInline | typeof WysiwygAdvanced;

export type WysiwygMode = typeof WysiwygDefault | typeof WysiwygAdvanced;
export type WysiwygView = typeof WysiwygInline | typeof WysiwygDialog;

export interface RawEditorOptionsWithModes extends RawEditorOptions, Omit<TinyMceModes, 'menubar' | 'toolbar' | 'contextmenu'> {

}

export interface TinyMceMode {
  currentMode: {
    view: WysiwygView,
    level: WysiwygMode,
  },
  menubar: boolean | string; // should match TinyMCE
  toolbar: string;
  contextmenu: string;
}

export interface TinyMceModes extends TinyMceMode {
  modeSwitcher: ToolbarSwitcher,
  modes: Record<TinyModeNames, TinyMceMode>;
}

export interface ToolbarSwitcher {
  switch(view: WysiwygView, mode: WysiwygMode): TinyMceMode;
}