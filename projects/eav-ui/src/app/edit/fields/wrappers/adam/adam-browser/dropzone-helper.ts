import { DropzoneConfigExt } from '../../../../../../../../edit-types';
import { UrlHelpers } from '../../../../shared/helpers';
import { AdamConfigInstance } from './adam-browser.models';
import { FieldConfigSet } from '../../../field-config-set.model';

export function fixDropzone(newConfig: AdamConfigInstance, fieldConfig: FieldConfigSet) {
  const oldDzConfig = fieldConfig.dropzone.getConfig();
  const newDzConfig: Partial<DropzoneConfigExt> = {};
  const dzUrlParams = UrlHelpers.getUrlParams(oldDzConfig.url as string);
  const dzSubfolder = dzUrlParams.subfolder || '';
  const dzUsePortalRoot = dzUrlParams.usePortalRoot;
  const fixUploadUrl = dzSubfolder !== newConfig.subfolder || dzUsePortalRoot !== newConfig.usePortalRoot.toString();

  if (fixUploadUrl) {
    let newUrl = oldDzConfig.url as string;
    newUrl = UrlHelpers.replaceUrlParam(newUrl, 'subfolder', newConfig.subfolder);
    newUrl = UrlHelpers.replaceUrlParam(newUrl, 'usePortalRoot', newConfig.usePortalRoot.toString());
    newDzConfig.url = newUrl;
  }

  const uploadDisabled = !newConfig.allowEdit
    || (
      (newConfig.subfolder === '' || newConfig.usePortalRoot && newConfig.subfolder === newConfig.rootSubfolder)
      && !newConfig.allowAssetsInRoot
    );

  const fixDisabled = oldDzConfig.disabled !== uploadDisabled;
  if (fixDisabled)
    newDzConfig.disabled = uploadDisabled;
  
  if (Object.keys(newDzConfig).length > 0)
    this.config.dropzone.setConfig(newDzConfig);
}