import { Injectable } from '@angular/core';
import { HttpServiceBase } from '../../shared/services/http-service-base';
import { App, PendingApp } from '../models/app.model';

 const webApiAppRootList = 'admin/app/list';
 const webApiAppRootInheritableApps = 'admin/app/InheritableApps';
 const webApiAppRootPendingApps = 'admin/app/GetPendingApps';
 const webApiAppRootApp = 'admin/app/app';
 const webApiAppRootInstallPendingApps = 'admin/app/InstallPendingApps';
 const webApiAppRootFlushcache = 'admin/app/flushcache';

@Injectable()
export class AppsListService extends HttpServiceBase {

  getAll() {
    return this.getSignal<App[]>(webApiAppRootList, {
      params: { zoneId: this.zoneId }
    });
  }

  getInheritable() {
    return this.getSignal<App[]>(webApiAppRootInheritableApps, {
      params: { zoneId: this.zoneId }
    });
  }

  getPendingApps() {
    return this.getSignal<PendingApp[]>(webApiAppRootPendingApps, {
      params: { zoneId: this.zoneId },
    });
  }

  create(name: string, inheritAppId?: number, templateId?: number) {
    return this.http.post<null>(this.apiUrl(webApiAppRootApp), {}, {
      params: {
        zoneId: this.zoneId,
        name,
        ...(inheritAppId != null && { inheritAppId }),
        ...(templateId != null && { templateId }),
      },
    });
  }

  installPendingApps(pendingApps: PendingApp[]) {
    return this.http.post<null>(this.apiUrl(webApiAppRootInstallPendingApps), pendingApps, {
      params: {
        zoneId: this.zoneId,
      },
    });
  }

  delete(appId: number) {
    return this.http.delete<null>(this.apiUrl(webApiAppRootApp), {
      params: { zoneId: this.zoneId, appId: appId.toString() },
    });
  }

  flushCache(appId: number) {
    return this.getHttpApiUrl<null>(webApiAppRootFlushcache, {
      params: { zoneId: this.zoneId, appId: appId.toString() },
    });
  }
}
