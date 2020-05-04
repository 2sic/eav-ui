import { IAdamConfig, IAdamModeConfig } from '../../../../edit-types';

export class AdamConfig implements IAdamConfig {
  constructor(
    public adamModeConfig: AdamModeConfig = { usePortalRoot: false },
    public allowAssetsInRoot: boolean = true,
    public autoLoad: boolean = false,
    public enableSelect: boolean = true,
    public fileFilter: string = '',
    public folderDepth: number = 0,
    public metadataContentTypes: string = '',
    public showImagesOnly: boolean = false,
    public subFolder: string = '',
  ) {
    this.adamModeConfig = adamModeConfig;
    this.allowAssetsInRoot = allowAssetsInRoot;
    this.autoLoad = autoLoad;
    this.enableSelect = enableSelect;
    this.folderDepth = folderDepth;
    this.fileFilter = fileFilter;
    this.metadataContentTypes = metadataContentTypes;
    this.showImagesOnly = showImagesOnly;
    this.subFolder = subFolder;
  }
}

export class AdamModeConfig implements IAdamModeConfig {
  constructor(
    public usePortalRoot: boolean,
  ) {
    this.usePortalRoot = usePortalRoot;
  }
}
