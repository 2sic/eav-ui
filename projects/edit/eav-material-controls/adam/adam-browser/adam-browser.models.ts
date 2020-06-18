import { AdamConfig } from '../../../../edit-types';

export class AdamConfigInstance implements AdamConfig {
  constructor(
    //#region Field settings
    public rootSubfolder = '',
    public fileFilter = '',
    public allowAssetsInRoot = true,
    public folderDepth = 0,
    public metadataContentTypes = '',
    //#endregion

    //#region Toggle
    public usePortalRoot = false,
    public showImagesOnly = false,
    //#endregion

    //#region Calculated
    public autoLoad = false,
    public enableSelect = true,
    public subfolder = '',
    public allowEdit = true,
    //#endregion
  ) { }
}
