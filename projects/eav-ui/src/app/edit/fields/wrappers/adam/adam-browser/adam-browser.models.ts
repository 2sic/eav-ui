import { AdamConfig } from '../../../../../../../../edit-types';
import { FieldConfigSet } from '../../../field-config-set.model';

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

  static completeConfig(config: Partial<AdamConfig>, fieldConfig: FieldConfigSet, oldConfig?: AdamConfigInstance): AdamConfigInstance {
    // set new values and use old ones where new value is not provided
    const startDisabled = fieldConfig.inputTypeSpecs.isExternal;
    oldConfig = oldConfig ?? new AdamConfigInstance(startDisabled);
    const newConfig = new AdamConfigInstance(startDisabled);

    for (const key of Object.keys(newConfig))
      (newConfig as any)[key] = (config as any)[key] ?? (oldConfig as any)[key];

    // fixes
    const resetSubfolder = oldConfig.usePortalRoot !== newConfig.usePortalRoot;
    if (resetSubfolder)
      newConfig.subfolder = '';

    if (newConfig.usePortalRoot) {
      const fixBackSlashes = newConfig.rootSubfolder.includes('\\');
      if (fixBackSlashes)
        newConfig.rootSubfolder = newConfig.rootSubfolder.replace(/\\/g, '/');
      const fixStartingSlash = newConfig.rootSubfolder.startsWith('/');
      if (fixStartingSlash)
        newConfig.rootSubfolder = newConfig.rootSubfolder.replace('/', '');
      const fixRoot = !newConfig.subfolder.startsWith(newConfig.rootSubfolder);
      if (fixRoot)
        newConfig.subfolder = newConfig.rootSubfolder;
      newConfig.maxDepthReached = false; // when using portal root depth is infinite
    }

    if (!newConfig.usePortalRoot) {
      const currentDepth = newConfig.subfolder ? newConfig.subfolder.split('/').length : 0;
      const fixDepth = currentDepth >= newConfig.folderDepth;
      if (fixDepth) {
        let folders = newConfig.subfolder.split('/');
        folders = folders.slice(0, newConfig.folderDepth);
        newConfig.subfolder = folders.join('/');
        newConfig.maxDepthReached = true;
      } else
        newConfig.maxDepthReached = false;
    }

    return newConfig;
  }

}
