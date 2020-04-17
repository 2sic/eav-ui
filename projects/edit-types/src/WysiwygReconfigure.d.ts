

export interface WysiwygReconfigure {

  /**
   * Very early call to configure the editorManager of tinyMCE
   * Here you can set i18n (translation tables) and more
   */
  managerInit?(editorManager: any): void;

  pluginsInit?(plugins: string[]): string[];

  optionsInit?(options: any): any;

  optionsReady?(options: any): any;

  i18nReady?(editorManager: any, currentLanguage: string): void;

  /** called when the editor was created, but before we added events etc. */
  editorInit?(editor: any): void;

  /** called after the form has prepared the editor */
  editorReady?(editor: any): void;

  // Just booleans to disable various features
  disablePagePicker?: boolean;
  disableAdam?: boolean;
}
