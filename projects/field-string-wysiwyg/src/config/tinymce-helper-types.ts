/*
  **Important**
  This file is also used by the project edit-types.
  Because of this, it should never import anything other than types, because otherwise that project will have trouble compiling.

  We may also end up moving this type to there later on.
*/
import type { RawEditorOptions } from 'tinymce';

export const TinyModeStandard = 'standard';
export const TinyModeInline = 'inline';
export const TinyModeAdvanced = 'advanced';
export type TinyModeNames = typeof TinyModeStandard | typeof TinyModeInline | typeof TinyModeAdvanced;

export interface RawEditorOptionsWithModes extends RawEditorOptions, Omit<TinyMceModes, 'menubar' | 'toolbar' | 'contextmenu'> {

}

export interface TinyMceMode  {
  menubar: boolean;
  toolbar: string;
  contextmenu: string;
}
export interface TinyMceModes {
  modes: Record<TinyModeNames, TinyMceMode>;
  menubar: boolean | string; // must match TinyMCE
  toolbar: string;
  contextmenu: string;
}
