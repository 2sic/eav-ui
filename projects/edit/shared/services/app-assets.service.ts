import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Context as DnnContext } from '@2sic.com/dnn-sxc-angular';

@Injectable()
export class AppAssetsService {
  constructor(private httpClient: HttpClient, private dnnContext: DnnContext) { }

  createSvc(appId: string, global: boolean): AssetsSvc {
    const params = {
      appId,
      global: global || false,
    };

    const getAll = () => {
      return this.httpClient.get(this.dnnContext.$2sxc.http.apiUrl('app-sys/appassets/list'), {
        params: Object.assign({}, params as any, { withSubfolders: 'true' }),
      });
    };

    const create = (path: string, content: any) => {
      return this.httpClient.post(
        this.dnnContext.$2sxc.http.apiUrl('app-sys/appassets/create'),
        { content: content || '' },
        { params: Object.assign({}, params as any, { path }) },
      );
    };

    return { getAll, create };
  }
}

export interface AssetsSvc {
  getAll: () => Observable<any>;
  create: (path: string, content: any) => Observable<any>;
}
