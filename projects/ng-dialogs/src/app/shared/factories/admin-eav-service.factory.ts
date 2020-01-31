import { Injector } from '@angular/core';
import { Router } from '@angular/router';
import { SxcRoot } from '@2sic.com/2sxc-typings';

import { UrlHelper } from '../../../../../edit/shared/helpers/url-helper';
import { QueryParameters } from '../models/query-parameters.model';
import { saveToSession, readFromSession } from '../helpers/session-storage.helper';
declare const $2sxc: SxcRoot;

export function adminEavServiceFactory(injector: Injector) {
  return function () {
    console.log('Setting parameters config and clearing route');
    const isParamsRoute = !window.location.hash.startsWith('#/');
    if (isParamsRoute) {
      // if params route save params and redirect
      const urlHash = window.location.hash.substring(1); // substring removes first # char
      const queryParametersFromUrl = UrlHelper.readQueryStringParameters(urlHash);
      const queryParameters = new QueryParameters();
      Object.keys(queryParameters).forEach(key => {
        saveToSession(key, queryParametersFromUrl[key]);
      });
      const router = injector.get(Router);
      const zoneId = readFromSession('zoneId');
      const appId = readFromSession('appId');
      const dialog = readFromSession('dialog');
      switch (dialog) {
        case 'edit':
          router.navigate([`${zoneId}/${appId}/edit`]);
          break;
        default:
          router.navigate([`${zoneId}/apps`]);
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
    page: parseInt(readFromSession('tid'), 10),
    rvt: readFromSession('rvt'),
    root: readFromSession('portalroot'),
    api: readFromSession('portalroot') + 'desktopmodules/2sxc/api/',
  });
}
