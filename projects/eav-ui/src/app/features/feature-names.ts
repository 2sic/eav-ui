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
  ContentTypeFieldsReuseDefinitions: 'ContentTypeFieldsReuseDefinitions',
  AppExportAssetsAdvanced: 'AppExportAssetsAdvanced',
  DataExportImportBundles: 'DataExportImportBundles',

  // Picker features
  PickerUiCheckbox: 'PickerUiCheckbox',
  PickerUiRadio: 'PickerUiRadio',
  PickerSourceCsv: 'PickerSourceCsv',
  PickerSourceAppAssets: 'PickerSourceAppAssets',
  PickerFormulas: 'PickerFormulas',
  PickerUiMoreInfo: 'PickerUiMoreInfo',
} as const /* the as const ensures that the keys/values can be strictly checked */;
