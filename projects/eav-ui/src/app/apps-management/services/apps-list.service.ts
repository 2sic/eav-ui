import { Injectable } from '@angular/core';
import { webApiAppRoot } from '../../import-app/services/import-app.service';
import { HttpServiceBase } from '../../shared/services/http-service-base';
import { App, PendingApp } from '../models/app.model';

@Injectable()
export class AppsListService extends HttpServiceBase {

  getAll() {
    return this.getHttp<App[]>(this.apiUrl(webApiAppRoot + 'list'), {
      params: { zoneId: this.zoneId }
    });
  }

  getInheritable() {
    return this.getHttp<App[]>(this.apiUrl(webApiAppRoot + 'InheritableApps'), {
      params: { zoneId: this.zoneId }
    });
  }

  getPendingApps() {
    return this.getHttp<PendingApp[]>(this.apiUrl(webApiAppRoot + 'GetPendingApps'), {
      params: { zoneId: this.zoneId },
    });
  }

  create(name: string, inheritAppId?: number, templateId?: number) {
    return this.http.post<null>(this.apiUrl(webApiAppRoot + 'app'), {}, {
      params: {
        zoneId: this.zoneId,
        name,
        ...(inheritAppId != null && { inheritAppId }),
        ...(templateId != null && { templateId }),
      },
    });
  }

  installPendingApps(pendingApps: PendingApp[]) {
    return this.http.post<null>(this.apiUrl(webApiAppRoot + 'InstallPendingApps'), pendingApps, {
      params: {
        zoneId: this.zoneId,
      },
    });
  }

  delete(appId: number) {
    return this.http.delete<null>(this.apiUrl(webApiAppRoot + 'app'), {
      params: { zoneId: this.zoneId, appId: appId.toString() },
    });
  }

  flushCache(appId: number) {
    return this.getHttp<null>(this.apiUrl(webApiAppRoot + 'flushcache'), {
      params: { zoneId: this.zoneId, appId: appId.toString() },
    });
  }
}
