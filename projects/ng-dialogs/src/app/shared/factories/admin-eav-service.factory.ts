import { Injector } from '@angular/core';
import { Router } from '@angular/router';

import { UrlHelper } from '../../../../../edit/src/app/shared/helpers/url-helper';
import { QueryParameters } from '../models/query-parameters.model';

export function adminEavServiceFactory(injector: Injector): Function {
  return function () {
    console.log('Setting admin parameters config and clearing route');
    const isParamsRoute = !window.location.hash.startsWith('#/');
    if (isParamsRoute) {
      // if params route save params and redirect
      const urlHash = window.location.hash.substring(1); // substring removes first # char
      const queryParametersFromUrl = UrlHelper.readQueryStringParameters(urlHash);
      const queryParameters = new QueryParameters();
      Object.keys(queryParameters).forEach(key => {
        sessionStorage.setItem(key, queryParametersFromUrl[key]);
      });
      const router = injector.get(Router);
      const zoneId = queryParametersFromUrl['zoneId'];
      router.navigate([`${zoneId}/apps`]);
    } else if (sessionStorage.length === 0) {
      // if not params route and no params are saved, e.g. browser was reopened, throw error
      alert('Missing required url parameters. Please reopen dialog.');
      throw new Error('Missing required url parameters. Please reopen dialog.');
    }
  };
}
