import { Editor, RawEditorSettings, TinyMCE } from 'tinymce';
import { AddOnSettings } from './AddOnSettings';

export interface WysiwygReconfigure {
  /**
   * Just booleans to disable various features
   */
  disablePagePicker?: boolean;
  /**
   * Just booleans to disable various features
   */
  disableAdam?: boolean;
  /**
   * Very early call to configure TinyMCE
   */
  initManager?(tinymce: TinyMCE): void;
  /**
   * Add translations to the editor manager - fairly early in the lifecycle
   */
  addTranslations?(tinymce: TinyMCE, currentLanguage: string): void;
  /**
   * Configure
   */
  configureAddOns(addOnSettings: AddOnSettings): AddOnSettings;
  /**
   * Review / modify the options after they have been completely initialized and expanded
   */
  configureOptions?(options: RawEditorSettings): RawEditorSettings;
  /**
   * Called when the editor was created, but before we added events etc.
   */
  editorOnInit?(editor: Editor): void;
  /**
   * Called after the form has prepared the editor
   */
  configureEditor?(editor: Editor): void;
}
