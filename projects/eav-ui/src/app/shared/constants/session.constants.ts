// TODO: @someday Change constants to be a object with these keys
// to make code which uses them clearer that these are global constants

export const prefix = 'eav-';
export const keyZoneId = `${prefix}zoneId`;
export const keyContentBlockId = `${prefix}cbid`;
export const keyModuleId = `${prefix}mid`;
export const keyAppId = `${prefix}appId`;
export const keyDebug = `${prefix}debug`;
export const keyDialog = `${prefix}dialog`;
export const keyContentType = `${prefix}contentType`;
export const keyItems = `${prefix}items`;
export const keyPartOfPage = `${prefix}partOfPage`;
export const keyPublishing = `${prefix}publishing`;
export const keyFilters = `${prefix}filters`;
export const keyPipelineId = `${prefix}pipelineId`;

/** WIP v16.01 */
export const keyEditFields = `${prefix}uifields`;

/** Url which opened the dialog. Used for debugging */
export const keyUrl = `${prefix}url`;

/** This is used by file editor to determine if it's editing shared files or of that portal only */
export const keyIsShared = `${prefix}isshared`;

/** 
 * Contains extra parameters for dialogs.
 * Example: { tab: 'settings' } or { scope: 'global' } - this would be for the data admin dialog.
 */
export const keyExtras = `${prefix}extras`;

/** Fallback value in case it is missing in url */
export const partOfPageDefault = 'false';

/** Language settings - multiple values (JSON), WIP 18.03 */
export const keySettings = `${prefix}settings`;

/**
 * NOTE: WIP
 * - v18.03 already introduced the various language parameters, but I believe there is as of v20 no case where this is passed in.
 * - v20 trying to introduce save behavior
 */
export interface DialogUiSettings {
  /** enable / disable the language-dialog button */
  languageUserSettings?: boolean | string;
  languageUi?: string;
  languageForm?: string;

  /**
   * Save behavior for the dialog.
   * - `false` means it will not save the form.
   * - `/any/path` means it will save the form to that path.
   */
  save: string;
}