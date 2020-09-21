import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Context as DnnContext } from '@2sic.com/dnn-sxc-angular';

import { Context } from '../../shared/services/context';
import { App } from '../models/app.model';
import { webApiAppRoot } from '../../import-app/services/import-app.service';

@Injectable()
export class AppsListService {
  constructor(private http: HttpClient, private context: Context, private dnnContext: DnnContext) { }

  private apiUrl(name: string): string {
    return this.dnnContext.$2sxc.http.apiUrl(name);
  }

  getAll() {
    return this.http.get(this.apiUrl(webApiAppRoot + 'list'), {
      params: { zoneId: this.context.zoneId.toString() }
    }) as Observable<App[]>;
  }

  create(name: string) {
    return this.http.post(this.apiUrl(webApiAppRoot + 'app'), {}, {
      params: { zoneId: this.context.zoneId.toString(), name }
    }) as Observable<null>;
  }

  delete(appId: number) {
    return this.http.delete(this.apiUrl(webApiAppRoot + 'app'), {
      params: { zoneId: this.context.zoneId.toString(), appId: appId.toString() },
    }) as Observable<null>;
  }

  flushCache(appId: number) {
    return this.http.get(this.apiUrl(webApiAppRoot + 'flushcache'), {
      params: { zoneId: this.context.zoneId.toString(), appId: appId.toString() },
    }) as Observable<null>;
  }
}
