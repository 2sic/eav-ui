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

/** Contains extra options for dialogs */
export const keyExtras = `${prefix}extras`;

/** Fallback value in case it is missing in url */
export const partOfPageDefault = 'false';

/** Language settings - multiple values (JSON), WIP 18.03 */
export const dialogSettings = `${prefix}dialogSettings`;
export const languageUi = `${prefix}languageui`;
export const languageLabels = `${prefix}languagelabels`;

export interface DialogUiSettings {
  languageUi?: string;
  languageForm?: string;
}