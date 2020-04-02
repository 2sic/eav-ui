import { Injector } from '@angular/core';
import { Router } from '@angular/router';
import { SxcRoot } from '@2sic.com/2sxc-typings';

import { UrlHelper } from '../../../../../edit/shared/helpers/url-helper';
// tslint:disable-next-line:max-line-length
import { keyZoneId, keyAppId, keyDialog, keyTabId, keyRequestToken, keyPortalRoot, keyItems, keyContentType } from '../constants/sessions-keys';
import { EditForm, EditItem } from '../../app-administration/shared/models/edit-form.model';
declare const $2sxc: SxcRoot;

export function paramsInitFactory(injector: Injector) {
  return () => {
    console.log('Setting parameters config and clearing route');
    const isParamsRoute = !window.location.hash.startsWith('#/');
    if (isParamsRoute) {
      // if params route save params and redirect
      const urlHash = window.location.hash.substring(1); // substring removes first # char
      const queryParametersFromUrl = UrlHelper.readQueryStringParameters(urlHash);
      Object.keys(queryParametersFromUrl).forEach(key => {
        const value = queryParametersFromUrl[key];
        if (value === undefined || value === null) { return; }
        sessionStorage.setItem(key, value);
      });
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
        case 'app':
          router.navigate([`${zoneId}/${appId}/app`]);
          break;
        case 'contenttype':
          router.navigate([`${zoneId}/${appId}/fields/${contentType}`]);
          break;
        case 'contentitems':
          // spm TODO: can also have filters for the grid in the url/sessionStorage
          router.navigate([`${zoneId}/${appId}/items/${contentType}`]);
          break;
        case 'edit':
          const parsedItems: EditItem[] = JSON.parse(items);
          const form: EditForm = { items: parsedItems };
          router.navigate([`${zoneId}/${appId}/edit/${JSON.stringify(form)}`]);
          break;
        case 'develop':
          router.navigate([`${zoneId}/${appId}/code`]);
          break;
        case 'pipeline-designer':
          alert('Feature not yet implemented. Opening queries list');
          router.navigate([`${zoneId}/${appId}/app/queries`]);
          break;
        case 'replace':
          router.navigate([`${zoneId}/${appId}/replace`]);
          break;
        default:
          alert(`Cannot open unknown dialog "${dialog}"`);
          try {
            (window.parent as any).$2sxc.totalPopup.close();
          } catch (error) { }
      }
    } else if (sessionStorage.length === 0) {
      // if not params route and no params are saved, e.g. browser was reopened, throw error
      alert('Missing required url parameters. Please reopen dialog.');
      throw new Error('Missing required url parameters. Please reopen dialog.');
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
