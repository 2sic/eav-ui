import { TinyType } from '../../field-string-wysiwyg/src/shared/models';
import { AddOnSettings } from './AddOnSettings';


export interface WysiwygReconfigure {

  /**
   * Very early call to configure the editorManager of tinyMCE
   */
  initManager?(editorManager: TinyType): void;

  /**
   * Add translations to the editor manager - fairly early in the lifecycle
   */
  addTranslations?(editorManager: TinyType, currentLanguage: string): void;

  /**
   * Configure
   */
  configureAddOns(addOnSettings: AddOnSettings): AddOnSettings;

  /**
   * Review / modify the options after they have been completely initialized and expanded
   */
  configureOptions?(options: TinyType): TinyType;

  /**
   * called when the editor was created, but before we added events etc.
   */
  editorOnInit?(editor: TinyType): void;

  /**
   * called after the form has prepared the editor
   */
  configureEditor?(editor: TinyType): void;

  // Just booleans to disable various features
  disablePagePicker?: boolean;
  disableAdam?: boolean;
}
