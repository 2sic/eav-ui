import { Context as DnnContext } from '@2sic.com/sxc-angular';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { webApiAppRoot } from '../../import-app/services/import-app.service';
import { Context } from '../../shared/services/context';
import { App, PendingApp } from '../models/app.model';

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

  getInheritable() {
    return this.http.get<App[]>(this.apiUrl(webApiAppRoot + 'InheritableApps'), {
      params: { zoneId: this.context.zoneId.toString() }
    });
  }

  getPendingApps() {
    return this.http.get<PendingApp[]>(this.apiUrl(webApiAppRoot + 'GetPendingApps'), {
      params: { zoneId: this.context.zoneId.toString() },
    });
  }

  create(name: string, inheritAppId?: number) {
    return this.http.post<null>(this.apiUrl(webApiAppRoot + 'app'), {}, {
      params: {
        zoneId: this.context.zoneId.toString(),
        name,
        ...(inheritAppId != null && { inheritAppId }),
      },
    });
  }

  installPendingApps(pendingApps: PendingApp[]) {
    return this.http.post<null>(this.apiUrl(webApiAppRoot + 'InstallPendingApps'), pendingApps, {
      params: {
        zoneId: this.context.zoneId.toString(),
      },
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
