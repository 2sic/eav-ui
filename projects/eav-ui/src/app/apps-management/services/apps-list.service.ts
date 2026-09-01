import { computed, inject, Injectable, Signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { map, Observable } from 'rxjs';
import { DialogConfigGlobalService } from '../../app-administration/services/dialog-config-global.service';
import { HttpServiceBaseSignal } from '../../shared/services/http-service-base-signal';
import { App, PendingApp } from '../models/app.model';

const dataSourceApps = 'System.Apps';
const dataSourceInheritableApps = 'System.InheritableApps';
const webApiAppRootApp = 'admin/app/app';
const webApiAppRootInstallPendingApps = 'admin/app/InstallPendingApps';
const webApiAppRootFlushcache = 'admin/app/flushcache';

@Injectable()
export class AppsListService extends HttpServiceBaseSignal {
  #dialogConfig = inject(DialogConfigGlobalService);
  #primaryAppId = toSignal(
    this.#dialogConfig.getShared$(0).pipe(
      map(settings => settings.Context.Site.PrimaryApp.AppId),
    ),
    { initialValue: 0 },
  );

  getAllLive(refresh: Signal<unknown>) {
    return this.#getSystemData<App>(dataSourceApps, refresh);
  }

  getInheritable() {
    return this.#getSystemData<App>(dataSourceInheritableApps);
  }

  getPendingApps() {
    const pendingApps = this.#getSystemData<PendingApp>('System.AppsPendingInitialization', undefined, {
      ZoneId: this.zoneId,
    });
    return { value: pendingApps };
  }

  #getSystemData<T>(source: string, refresh?: Signal<unknown>, params?: Record<string, string>) {
    const resource = this.newHttpResource<{ Default: T[] }>(() => {
      const appId = this.#primaryAppId();
      if (!appId)
        return;

      refresh?.();
      return {
        url: 'app/auto/query/System.SysData/Default',
        params: {
          appId,
          SysDataSource: source,
          ...params,
        },
      };
    });
    return computed(() => resource.value()?.Default ?? []);
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
