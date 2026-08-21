import { Injectable, Signal } from '@angular/core';
import { transient } from 'projects/core';
import { Observable } from 'rxjs';
import { HttpServiceBaseSignal } from '../../shared/services/http-service-base-signal';
import { SysDataService } from '../../shared/services/sys-data.service';
import { App, PendingApp } from '../models/app.model';

const dataSourceApps = 'System.Apps';
const dataSourceInheritableApps = 'System.InheritableApps';
const webApiAppRootApp = 'admin/app/app';
const webApiAppRootInstallPendingApps = 'admin/app/InstallPendingApps';
const webApiAppRootFlushcache = 'admin/app/flushcache';

@Injectable()
export class AppsListService extends HttpServiceBaseSignal {
  #sysData = transient(SysDataService);

  getAllLive(refresh: Signal<unknown>) {
    return this.#sysData.get<App>({
      refresh,
      source: dataSourceApps,
      noCamel: true,
    });
  }

  getInheritable() {
    return this.#sysData.get<App>({
      source: dataSourceInheritableApps,
      noCamel: true,
    });
  }

  getPendingApps() {
    const pendingApps = this.#sysData.get<PendingApp>({
      source: 'System.AppsPendingInitialization',
      params: { ZoneId: this.zoneId },
      noCamel: true,
    });
    return { value: pendingApps };
  }

  create(name: string, inheritAppId?: number, templateId?: number, folder?: string, displayName?: string) {
    const params: Record<string, string | number | boolean | readonly (string | number | boolean)[]> = {
      zoneId: this.zoneId,
      name,
    };

    if (inheritAppId != null) {
      params.inheritAppId = inheritAppId;
      params.displayName = displayName ?? name;
      params.folder = folder ?? name;
    }

    if (templateId != null)
      params.templateId = templateId;

    return this.http.post<null>(this.apiUrl(webApiAppRootApp), {}, {
      params,
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
