import { Context as DnnContext } from '@2sic.com/dnn-sxc-angular';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { webApiAppRoot } from '../../import-app/services/import-app.service';
import { Context } from '../../shared/services/context';
import { App } from '../models/app.model';

@Injectable()
export class AppsListService {
  constructor(private http: HttpClient, private context: Context, private dnnContext: DnnContext) { }

  private apiUrl(name: string) {
    return this.dnnContext.$2sxc.http.apiUrl(name);
  }

  getAll() {
    return this.http.get<App[]>(this.apiUrl(webApiAppRoot + 'list'), {
      params: { zoneId: this.context.zoneId.toString() }
    });
  }

  create(name: string) {
    return this.http.post<null>(this.apiUrl(webApiAppRoot + 'app'), {}, {
      params: { zoneId: this.context.zoneId.toString(), name }
    });
  }

  delete(appId: number) {
    return this.http.delete<null>(this.apiUrl(webApiAppRoot + 'app'), {
      params: { zoneId: this.context.zoneId.toString(), appId: appId.toString() },
    });
  }

  flushCache(appId: number) {
    return this.http.get<null>(this.apiUrl(webApiAppRoot + 'flushcache'), {
      params: { zoneId: this.context.zoneId.toString(), appId: appId.toString() },
    });
  }
}
