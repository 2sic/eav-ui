// This will make it easier for us to see where certain feature names are in use

export const FeatureNames = {
  AppSyncWithSiteFiles: 'AppSyncWithSiteFiles',
  WysiwygPasteFormatted: 'WysiwygPasteFormatted',
  PasteImageFromClipboard: 'PasteImageFromClipboard',
  EditUiShowNotes: 'EditUiShowNotes',
  EditUiShowMetadataFor: 'EditUiShowMetadataFor',
  NoSponsoredByToSic: 'NoSponsoredByToSic',
  EditUiTranslateWithGoogle: 'EditUiTranslateWithGoogle',
  LightSpeed: 'LightSpeedOutputCache',
  ContentSecurityPolicy: 'ContentSecurityPolicy',
  PermissionsByLanguage: 'PermissionsByLanguage',
  FieldShareConfigManagement: 'FieldShareConfigManagement',
  AppExportAssetsAdvanced: 'AppExportAssetsAdvanced',

  // Picker features
  PickerUiCheckbox: 'PickerUiCheckbox',
  PickerUiRadio: 'PickerUiRadio',
  PickerSourceCsv: 'PickerSourceCsv',
} as const /* the as const ensures that the keys/values can be strictly checked */;

// export type OfFeatureName = typeof FeatureNames[keyof typeof FeatureNames];

// TODO: put in a shared file and replace other typeof X[keyof typeof X]; (look for "keyof typeof")
export type Of<T> = T[keyof T];