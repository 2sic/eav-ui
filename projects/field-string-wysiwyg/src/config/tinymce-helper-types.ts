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
