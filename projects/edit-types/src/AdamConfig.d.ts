export interface AdamConfig {
  //#region Field settings
  rootSubfolder: string,
  fileFilter: string,
  allowAssetsInRoot: boolean,
  folderDepth: number,
  metadataContentTypes: string,
  //#endregion

  //#region Toggle
  usePortalRoot: boolean;
  showImagesOnly: boolean;
  //#endregion

  //#region Calculated
  autoLoad: boolean,
  enableSelect: boolean,
  subfolder: string,
  allowEdit: boolean,
  disabled: boolean,
  //#endregion
}
