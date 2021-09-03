import { Context as DnnContext } from '@2sic.com/dnn-sxc-angular';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { EavService } from '.';

export const webApiAppFilesAll = 'admin/appfiles/all';
export const webApiAppFile = 'admin/appfiles/asset';
export const webApiAppFileCreate = 'admin/appfiles/create';
export const webApiExplorer = 'admin/ApiExplorer/inspect';
@Injectable()
export class AssetsService {
  constructor(private http: HttpClient, private eavService: EavService, private dnnContext: DnnContext) { }

  getAll(global: boolean) {
    return this.http.get<string[]>(this.dnnContext.$2sxc.http.apiUrl(webApiAppFilesAll), {
      params: { appId: this.eavService.eavConfig.appId, global: global.toString(), withSubfolders: 'true' },
    });
  }

  create(path: string, global: boolean, purpose: string) {
    return this.http.post<boolean>(this.dnnContext.$2sxc.http.apiUrl(webApiAppFileCreate), {}, {
      params: { appId: this.eavService.eavConfig.appId, global: global.toString(), purpose, path }
    });
  }
}
