import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Context as DnnContext } from '@2sic.com/dnn-sxc-angular';

import { EavService } from './eav.service';

@Injectable()
export class AssetsService {
  constructor(private http: HttpClient, private eavService: EavService, private dnnContext: DnnContext) { }

  getAll(global: boolean) {
    return this.http.get(this.dnnContext.$2sxc.http.apiUrl('app-sys/appassets/list'), {
      params: { appId: this.eavService.eavConfig.appId.toString(), global: global.toString(), withSubfolders: 'true' },
    }) as Observable<string[]>;
  }

  create(path: string, global: boolean) {
    return this.http.post(
      this.dnnContext.$2sxc.http.apiUrl('app-sys/appassets/create'), {}, {
      params: { appId: this.eavService.eavConfig.appId.toString(), global: global.toString(), path }
    }) as Observable<boolean>;
  }
}
