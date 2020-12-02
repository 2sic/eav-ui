import { AdamConfig, AdamItem } from '../../../../edit-types';

export interface AdamBrowserTemplateVars {
  adamConfig: AdamConfig;
  expanded: boolean;
  items: AdamItem[];
  value: string;
  disabled: boolean;
}

export class AdamConfigInstance implements AdamConfig {
  //#region Field settings
  rootSubfolder = '';
  fileFilter = '';
  allowAssetsInRoot = true;
  folderDepth = 0;
  metadataContentTypes = '';
  //#endregion

  //#region Toggle
  usePortalRoot = false;
  showImagesOnly = false;
  //#endregion

  //#region Calculated
  autoLoad = false;
  enableSelect = true;
  subfolder = '';
  allowEdit = true;
  disabled = true;
  maxDepthReached = false;
  //#endregion

  constructor(disabled: boolean) {
    this.disabled = disabled;
  }
}
