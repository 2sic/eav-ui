import { Context as DnnContext } from '@2sic.com/dnn-sxc-angular';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { webApiAppFileCreate, webApiAppFilesAll } from 'projects/edit';
import { Observable } from 'rxjs';
import { Context } from '../../shared/services/context';

@Injectable()
export class WebApisService {
  constructor(private http: HttpClient, private context: Context, private dnnContext: DnnContext) { }

  getAll() {
    return this.http.get(this.dnnContext.$2sxc.http.apiUrl(webApiAppFilesAll), {
      params: { appId: this.context.appId.toString(), path: '', mask: '*Controller.cs', withSubfolders: 'true' },
    }) as Observable<string[]>;
  }

  create(name: string) {
    return this.http.post(this.dnnContext.$2sxc.http.apiUrl(webApiAppFileCreate), {}, {
      params: { appId: this.context.appId.toString(), global: 'false', path: `api/${name}` },
    }) as Observable<boolean>;
  }
}
