import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { UrlConstants } from '../constants/url-constants';

@Injectable({
  providedIn: 'root'
})
export class AppAssetsService {
  constructor(
    private httpClient: HttpClient,
  ) { }

  createSvc(appId: string, global: boolean): AssetsSvc {
    const params = {
      appId: appId,
      global: global || false,
    };

    const getAll = () => {
      return this.httpClient.get(
        `${UrlConstants.apiRoot}app-sys/appassets/list`,
        { params: Object.assign({}, params, { withSubfoders: 'true' }) }
      );
    };

    const create = (path: string, content: any) => {
      return this.httpClient.post(
        `${UrlConstants.apiRoot}app-sys/appassets/create`,
        { content: content || '' },
        { params: Object.assign({}, params, { path: path }) },
      );
    };

    return { getAll, create };
  }

}

export interface AssetsSvc {
  getAll: () => Observable<any>;
  create: (path: string, content: any) => Observable<any>;
}
