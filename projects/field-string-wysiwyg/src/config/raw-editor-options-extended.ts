/*
  **Important**
  This file is also used by the project edit-types.
  Because of this, it should never import anything other than types, because otherwise that project will have trouble compiling.

  We may also end up moving this type to there later on.
*/
import type { RawEditorOptions } from 'tinymce';
import { WysiwygConfigurationManager } from './wysiwyg-configuration-manager';

export interface RawEditorOptionsExtended extends RawEditorOptions {
  /**
   * The new configuration manager which should take care of everything.
   */
  configManager: WysiwygConfigurationManager;
}
