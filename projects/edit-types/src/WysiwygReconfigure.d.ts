import { AddOnSettings } from './AddOnSettings';


export interface WysiwygReconfigure {

  /**
   * Very early call to configure the editorManager of tinyMCE
   */
  initManager?(editorManager: any): void;

  /**
   * Add translations to the editor manager - fairly early in the lifecycle
   */
  addTranslations?(editorManager: any, currentLanguage: string): void;

  /**
   * Configure
   */
  configureAddOns(addOnSettings: AddOnSettings): AddOnSettings;

  /**
   * Review / modify the options after they have been completely initialized and expanded
   */
  configureOptions?(options: any): any;

  /**
   * called when the editor was created, but before we added events etc.
   */
  editorOnInit?(editor: any): void;

  /**
   * called after the form has prepared the editor
   */
  configureEditor?(editor: any): void;

  // Just booleans to disable various features
  disablePagePicker?: boolean;
  disableAdam?: boolean;
}
