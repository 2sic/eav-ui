import { Injector } from '@angular/core';
import { Router } from '@angular/router';
import { SxcRoot } from '@2sic.com/2sxc-typings';

import { UrlHelper } from '../../../edit/shared/helpers/url-helper';
// tslint:disable-next-line:max-line-length
import { keyZoneId, keyAppId, keyDialog, keyTabId, keyRequestToken, keyPortalRoot, keyItems, keyContentType, keyUrl, prefix, keyPipelineId } from './shared/constants/session.constants';
import { EditForm, EditItem, GroupItem } from './shared/models/edit-form.model';
import { query } from '@angular/animations';
declare const $2sxc: SxcRoot;

export function paramsInitFactory(injector: Injector) {
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
      sessionStorage.setItem(keyDialog, 'edit'); // set edit dialog as the default

      // save params
      const urlHash = window.location.hash.substring(1); // substring removes first # char
      const queryParametersFromUrl = UrlHelper.readQueryStringParameters(urlHash);
      const paramKeys = Object.keys(queryParametersFromUrl);
      for (const key of paramKeys) {
        const value = queryParametersFromUrl[key];
        if (value === undefined || value === null) { continue; }
        sessionStorage.setItem(prefix + key, value);
      }

      // redirect
      const router = injector.get(Router);
      const zoneId = sessionStorage.getItem(keyZoneId);
      const appId = sessionStorage.getItem(keyAppId);
      const dialog = sessionStorage.getItem(keyDialog);
      const contentType = sessionStorage.getItem(keyContentType);
      const items = sessionStorage.getItem(keyItems);
      switch (dialog) {
        case 'zone':
          router.navigate([`${zoneId}/apps`]);
          break;
        case 'app-import':
          router.navigate([`${zoneId}/import`]);
          break;
        case 'app':
          router.navigate([`${zoneId}/${appId}/app`]);
          break;
        case 'contenttype':
          router.navigate([`${zoneId}/${appId}/fields/${contentType}`]);
          break;
        case 'contentitems':
          router.navigate([`${zoneId}/${appId}/items/${contentType}`]);
          break;
        case 'edit':
          const editItems: EditItem[] = JSON.parse(items);
          const form: EditForm = { items: editItems };
          router.navigate([`${zoneId}/${appId}/edit/${JSON.stringify(form)}`]);
          break;
        case 'develop':
          router.navigate([`${zoneId}/${appId}/code`]);
          break;
        case 'pipeline-designer':
          const pipelineId = sessionStorage.getItem(keyPipelineId);
          router.navigate([`${zoneId}/${appId}/query/${pipelineId}`]);
          break;
        case 'replace':
          const replaceItems: GroupItem[] = JSON.parse(items);
          const rGuid = replaceItems[0].Group.Guid;
          const rPart = replaceItems[0].Group.Part;
          const rIndex = replaceItems[0].Group.Index;
          const add = replaceItems[0].Group.Add;
          const queryParams = add ? {add: true} : {};
          router.navigate([`${zoneId}/${appId}/${rGuid}/${rPart}/${rIndex}/replace`], {queryParams});
          break;
        case 'instance-list':
          const groupItems: GroupItem[] = JSON.parse(items);
          const gGuid = groupItems[0].Group.Guid;
          const gPart = groupItems[0].Group.Part;
          const gIndex = groupItems[0].Group.Index;
          router.navigate([`${zoneId}/${appId}/${gGuid}/${gPart}/${gIndex}/reorder`]);
          break;
        default:
          alert(`Cannot open unknown dialog "${dialog}"`);
          try {
            (window.parent as any).$2sxc.totalPopup.close();
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
  $2sxc.env.load({
    page: parseInt(sessionStorage.getItem(keyTabId), 10),
    rvt: sessionStorage.getItem(keyRequestToken),
    root: sessionStorage.getItem(keyPortalRoot),
    api: sessionStorage.getItem(keyPortalRoot) + 'desktopmodules/2sxc/api/',
  });
}
