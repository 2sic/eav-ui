import { Context as DnnContext } from '@2sic.com/dnn-sxc-angular';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { EavService } from './eav.service';

const webApiAppFilesRoot = 'admin/appfiles/';
export const webApiAppFilesAll = webApiAppFilesRoot + 'all';
export const webApiAppFile = webApiAppFilesRoot + 'asset';
export const webApiAppFileCreate = webApiAppFilesRoot + 'create';

@Injectable()
export class AssetsService {
  constructor(private http: HttpClient, private eavService: EavService, private dnnContext: DnnContext) { }

  getAll(global: boolean) {
    return this.http.get(this.dnnContext.$2sxc.http.apiUrl(webApiAppFilesAll), {
      params: { appId: this.eavService.eavConfig.appId.toString(), global: global.toString(), withSubfolders: 'true' },
    }) as Observable<string[]>;
  }

  create(path: string, global: boolean) {
    return this.http.post(
      this.dnnContext.$2sxc.http.apiUrl(webApiAppFileCreate), {}, {
      params: { appId: this.eavService.eavConfig.appId.toString(), global: global.toString(), path }
    }) as Observable<boolean>;
  }
}
