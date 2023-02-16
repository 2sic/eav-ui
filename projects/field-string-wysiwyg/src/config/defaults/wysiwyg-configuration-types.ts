import type { RawEditorOptions } from 'tinymce';
import { TinyEavFeatures, TinyEavButtons } from '../tinymce-config';
import { WysiwygEditMode } from '../../constants/edit-modes';
import { DisplayModes } from '../../constants/display-modes';

export interface WysiwygConfigurationSet extends WysiwygConfiguration {
  variations: Partial<WysiwygConfigurationVariation>[],
}

export interface WysiwygConfigurationVariation extends Omit<WysiwygConfiguration, "editMode" | "displayMode"> {
  /**
   * The view name this variation is for.
   */
  displayMode: DisplayModes;
}

/**
 * The main configuration of a wysiwyg.
 * This is the configuration that is used to create the editor.
 */
export interface WysiwygConfiguration {
  /**
   * Name of this mode - used to identify the mode or load presets for anything not specified here
   */
  editMode: WysiwygEditMode,

  /**
   * The view name this variation is for.
   */
  displayMode?: DisplayModes;

  /**
   * The buttons which are active/inactive
   */
  buttons: TinyEavButtons;

  /**
   * The features which are active/inactive
   */
  features: TinyEavFeatures;
  
  /**
   * The context menu in this mode
   */
  contextMenu: string[];

  /**
   * Show the menu bar (the dropdowns)
   */
  menubar: boolean | string; // should match TinyMCE

  /**
   * Any standard tinyMce options which are already in the correct format
   * Will be created by the configuration manager
   */
  tinyMce: RawEditorOptions;

  /**
   * Options which apply to this mode
   */
  tinyMceOptions: RawEditorOptions;

  /**
   * Plugins which should be activated.
   * Note that by default, only a certain amount of plugins are loaded, so normally you can only remove plugins but not add any.
   */
  tinyMcePlugins: string[];

  /**
   * The toolbar to use in this mode
   */
  toolbar: string[];
}
