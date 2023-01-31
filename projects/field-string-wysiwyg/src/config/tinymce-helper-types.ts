/*
  **Important**
  This file is also used by the project edit-types.
  Because of this, it should never import anything other than types, because otherwise that project will have trouble compiling.

  We may also end up moving this type to there later on.
*/
import type { RawEditorOptions } from 'tinymce';
import * as DialogModes from '../constants/display-modes';
import * as EditModes from '../constants/edit-modes';
import { TinyEavConfig } from './tinymce-config';

export interface RawEditorOptionsWithEav extends RawEditorOptions, Omit<TinyMceMode, 'menubar' | 'toolbar' | 'contextmenu'> {
  eavConfig: TinyEavConfig;
}

export interface TinyMceMode {
  currentMode: {
    displayMode: DialogModes.DisplayModes,
    editMode: EditModes.WysiwygEditMode,
  };
  menubar: boolean | string; // should match TinyMCE
  toolbar: string | string[]; // should match TinyMCE
  contextmenu: string;
  modeSwitcher: ToolbarSwitcher;
}

export interface ToolbarSwitcher {
  // isDialog(editor: Editor): boolean;
  switch(displayMode: DialogModes.DisplayModes, editMode: EditModes.WysiwygEditMode): TinyMceMode;
}
