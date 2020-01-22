import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { UrlConstants } from '../constants/url-constants';
import { EavConfiguration } from '../models/eav-configuration';
import { EavService } from './eav.service';

@Injectable({
  providedIn: 'root'
})
export class AppAssetsService {
  private eavConfig: EavConfiguration;

  constructor(
    private httpClient: HttpClient,
    private eavService: EavService,
  ) {
    this.eavConfig = this.eavService.getEavConfiguration();
  }

  createSvc(appId: string, global: boolean): AssetsSvc {
    const params = {
      appId: appId,
      global: global || false,
    };

    const getAll = () => {
      return this.httpClient.get(
        `${this.eavConfig.portalroot + UrlConstants.apiRoot}app-sys/appassets/list`,
        { params: Object.assign({}, params, { withSubfolders: 'true' }) }
      );
    };

    const create = (path: string, content: any) => {
      return this.httpClient.post(
        `${this.eavConfig.portalroot + UrlConstants.apiRoot}app-sys/appassets/create`,
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
