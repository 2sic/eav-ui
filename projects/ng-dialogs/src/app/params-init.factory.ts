import { JsInfo } from '@2sic.com/2sxc-typings';
import { Injector } from '@angular/core';
import { Router } from '@angular/router';
import { UrlHelpers } from '../../../edit/shared/helpers/url.helpers';
import { DialogTypeConstant, DialogTypeConstants } from './shared/constants/dialog-type.constants';
// tslint:disable-next-line:max-line-length
import { keyApi, keyAppId, keyContentType, keyDialog, keyExtras, keyItems, keyPipelineId, keyRequestToken, keyRequestTokenHeaderName, keyTabId, keyUrl, keyZoneId, prefix } from './shared/constants/session.constants';
import { convertFormToUrl } from './shared/helpers/url-prep.helper';
import { ExtrasParam } from './shared/models/dialog-url-params.model';
import { EavWindow } from './shared/models/eav-window.model';
import { EditForm, EditItem, GroupItem } from './shared/models/edit-form.model';

declare const window: EavWindow;

export function paramsInitFactory(injector: Injector): () => void {
  return () => {
    console.log('Setting parameters config and clearing route');
    const eavKeys = Object.keys(sessionStorage).filter(key => key.startsWith(prefix));
    const isParamsRoute = !window.location.hash.startsWith('#/');
    if (isParamsRoute) {
      console.log('Initial route:', window.location.href);
      // clear our part of the session
      for (const key of eavKeys) {
        sessionStorage.removeItem(key);
      }
      sessionStorage.setItem(keyUrl, window.location.href); // save url which opened the dialog
      sessionStorage.setItem(keyDialog, DialogTypeConstants.Edit); // set edit dialog as the default

      // save params
      const urlHash = window.location.hash.substring(1); // substring removes first # char
      const queryParametersFromUrl = UrlHelpers.readQueryStringParameters(urlHash);

      for (const [paramKey, paramValue] of Object.entries(queryParametersFromUrl)) {
        if (paramValue == null) { continue; }
        sessionStorage.setItem(prefix + paramKey, paramValue);
      }

      // redirect
      const router = injector.get(Router);
      const zoneId = sessionStorage.getItem(keyZoneId);
      const appId = sessionStorage.getItem(keyAppId);
      const dialog = sessionStorage.getItem(keyDialog) as DialogTypeConstant;
      const contentType = sessionStorage.getItem(keyContentType);
      const items = sessionStorage.getItem(keyItems);
      switch (dialog) {
        case DialogTypeConstants.Zone:
          router.navigate([`${zoneId}/apps`]);
          break;
        case DialogTypeConstants.AppImport:
          router.navigate([`${zoneId}/import`]);
          break;
        case DialogTypeConstants.App:
          const extras: ExtrasParam = JSON.parse(sessionStorage.getItem(keyExtras));
          router.navigate([`${zoneId}/${appId}/app${extras ? `/${extras.tab}/${extras.scope}` : ''}`]);
          break;
        case DialogTypeConstants.ContentType:
          router.navigate([`${zoneId}/${appId}/fields/${contentType}`]);
          break;
        case DialogTypeConstants.ContentItems:
          router.navigate([`${zoneId}/${appId}/items/${contentType}`]);
          break;
        case DialogTypeConstants.Edit:
          const editItems: EditItem[] = JSON.parse(items);
          const form: EditForm = { items: editItems };
          const formUrl = convertFormToUrl(form);
          router.navigate([`${zoneId}/${appId}/edit/${formUrl}`]);
          break;
        case DialogTypeConstants.ItemHistory:
          const historyItems: EditItem[] = JSON.parse(items);
          router.navigate([`${zoneId}/${appId}/versions/${historyItems[0].EntityId}`]);
          break;
        case DialogTypeConstants.Develop:
          router.navigate([`${zoneId}/${appId}/code`]);
          break;
        case DialogTypeConstants.PipelineDesigner:
          const pipelineId = sessionStorage.getItem(keyPipelineId);
          router.navigate([`${zoneId}/${appId}/query/${pipelineId}`]);
          break;
        case DialogTypeConstants.Replace:
          const replaceItems: GroupItem[] = JSON.parse(items);
          const rGuid = replaceItems[0].Group.Guid;
          const rPart = replaceItems[0].Group.Part;
          const rIndex = replaceItems[0].Group.Index;
          const add = replaceItems[0].Group.Add;
          const queryParams = add ? { add: true } : {};
          router.navigate([`${zoneId}/${appId}/${rGuid}/${rPart}/${rIndex}/replace`], { queryParams });
          break;
        case DialogTypeConstants.InstanceList:
          const groupItems: GroupItem[] = JSON.parse(items);
          const gGuid = groupItems[0].Group.Guid;
          const gPart = groupItems[0].Group.Part;
          const gIndex = groupItems[0].Group.Index;
          router.navigate([`${zoneId}/${appId}/${gGuid}/${gPart}/${gIndex}/reorder`]);
          break;
        default:
          alert(`Cannot open unknown dialog "${dialog}"`);
          try {
            window.parent.$2sxc.totalPopup.close();
          } catch (error) { }
      }
    } else if (eavKeys.length === 0) {
      // if not params route and no params are saved, e.g. browser was reopened, throw error
      alert('Missing required url parameters. Please reopen dialog.');
      throw new Error('Missing required url parameters. Please reopen dialog.');
    } else {
      console.log('Initial route:', sessionStorage.getItem(keyUrl));
    }

    loadEnvironment();
  };
}

function loadEnvironment() {
  const jsInfo: Partial<JsInfo> | { rvtHeader: string } = { // #RvtHeaderName - New in 12.04
    page: parseInt(sessionStorage.getItem(keyTabId), 10),
    rvt: sessionStorage.getItem(keyRequestToken),
    rvtHeader: sessionStorage.getItem(keyRequestTokenHeaderName), // #RvtHeaderName - New in 12.04
    api: sessionStorage.getItem(keyApi),
  };
  window.$2sxc.env.load(jsInfo as JsInfo);
}
