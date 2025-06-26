import { httpResource } from '@angular/common/http';
import { Injectable, Signal } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpServiceBaseSignal } from '../../shared/services/http-service-base-signal';
import { App, PendingApp } from '../models/app.model';

const webApiAppRootList = 'admin/app/list';
const webApiAppRootInheritableApps = 'admin/app/InheritableApps';
const webApiAppRootPendingApps = 'admin/app/GetPendingApps';
const webApiAppRootApp = 'admin/app/app';
const webApiAppRootInstallPendingApps = 'admin/app/InstallPendingApps';
const webApiAppRootFlushcache = 'admin/app/flushcache';

@Injectable()
export class AppsListService extends HttpServiceBaseSignal {

  // clean way to create a new resource every time if refresh change
  getAllLive(refresh: Signal<unknown>) {
    return httpResource<App[]>(() => {
      refresh();
      return ({
        url: this.apiUrl(webApiAppRootList),
        params: { zoneId: this.zoneId }
      });
    });
  }

  getInheritable() {
    return httpResource<App[]>(() => ({
      url: this.apiUrl(webApiAppRootInheritableApps),
      params: { zoneId: this.zoneId }
    }));
  }

  getPendingApps() {
    return httpResource<PendingApp[]>(() => ({
      url: this.apiUrl(webApiAppRootPendingApps),
      params: { zoneId: this.zoneId },
    }));
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

  createTemplate(url: string, newName: string) {
    const encodedName = encodeURIComponent(newName);
    return <Observable<any>>this.http.post(`sys/install/RemotePackage?packageUrl=${url}&newName=${encodedName}`, {});
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

  async flushCache(appId: number): Promise<number> {
    return this.getStatusPromise(webApiAppRootFlushcache, {
      params: { zoneId: this.zoneId, appId: appId.toString() },
    });
  }

}
