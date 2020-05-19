

export interface WysiwygReconfigure {

  /**
   * Very early call to configure the editorManager of tinyMCE
   * Here you can set i18n (translation tables) and more
   */
  managerInit?(editorManager: any): void;

  /**
   * Add translations to the editor manager - fairly early in the lifecycle
   */
  addTranslations?(editorManager: any, currentLanguage: string): void;

  /**
   * Init the options - both global and local
   */
  optionsInit?(global: any, instance: any): void;

  /**
   * Review / modify the options after they have been completely initialized and expanded
   */
  optionsReady?(options: any): any;

  /** called when the editor was created, but before we added events etc. */
  editorInit?(editor: any): void;

  /** called after the form has prepared the editor */
  editorBuilt?(editor: any): void;

  // Just booleans to disable various features
  disablePagePicker?: boolean;
  disableAdam?: boolean;
}
