/*
  **Important**
  This file is also used by the project edit-types.
  Because of this, it should never import anything other than types, because otherwise that project will have trouble compiling.

  We may also end up moving this type to there later on.
*/
import type { RawEditorOptions } from 'tinymce';
import * as DialogModes from '../constants/display-modes';
import * as EditModes from '../constants/edit-modes';
import { WysiwygConfigurationManager } from './defaults/wysiwyg-configuration-manager';

export interface RawEditorOptionsWithEav extends RawEditorOptions, Omit<TinyMceMode, 'menubar' | 'toolbar' | 'contextmenu'> {
  /**
   * The new configuration manager which should take care of everything.
   */
  configManager: WysiwygConfigurationManager;
}

export interface TinyMceMode {
  currentMode: {
    displayMode: DialogModes.DisplayModes,
    editMode: EditModes.WysiwygEditMode,
  };
  menubar: boolean | string; // should match TinyMCE
  toolbar: string | string[]; // should match TinyMCE
}
