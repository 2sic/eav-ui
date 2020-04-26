import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Context as DnnContext } from '@2sic.com/dnn-sxc-angular';

import { Context } from '../../../shared/services/context';

@Injectable()
export class WebApisService {
  constructor(private http: HttpClient, private context: Context, private dnnContext: DnnContext) { }

  getAll() {
    return this.http.get(this.dnnContext.$2sxc.http.apiUrl('app-sys/appassets/list'), {
      params: { appId: this.context.appId.toString(), path: '', mask: '*Controller.cs', withSubfolders: 'true' },
    }) as Observable<string[]>;
  }

  create(name: string) {
    return this.http.post(this.dnnContext.$2sxc.http.apiUrl('app-sys/appassets/create'), {}, {
      params: { appId: this.context.appId.toString(), global: 'false', path: `api/${name}` },
    }) as Observable<boolean>;
  }
}
