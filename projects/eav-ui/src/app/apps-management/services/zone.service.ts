import { httpResource } from '@angular/common/http';
import { Injectable, Signal } from '@angular/core';
import { HttpServiceBaseSignal } from '../../shared/services/http-service-base-signal';
import { SiteLanguage, SiteLanguagePermissions } from '../models/site-language.model';
import { SystemInfoSet } from '../models/system-info.model';

const webApiZoneRootGetLanguages = 'admin/zone/GetLanguages';
const webApiZoneRootSwitchLanguage = 'admin/zone/SwitchLanguage';
const webApiZoneRootGetSystemInfo = 'admin/zone/GetSystemInfo';
const webApiAppRootLanguages = 'admin/app/languages';

@Injectable()
export class ZoneService extends HttpServiceBaseSignal {

  getLanguageLive(refresh: Signal<unknown>) {
    return httpResource<SiteLanguage[]>(() => {
      refresh();
      return ({
        url: this.apiUrl(webApiZoneRootGetLanguages),
        params: { appId: this.appId }
      });
    });
  }

  async toggleLanguage(code: string, enable: boolean): Promise<number> {
    return this.getStatusPromise(webApiZoneRootSwitchLanguage, {
      params: { cultureCode: code, enable: enable.toString() },
    });
  }

  getSystemInfoLive(refresh: Signal<unknown>) {
    return httpResource<SystemInfoSet>(() => {
      refresh();
      return ({
        url: this.apiUrl(webApiZoneRootGetSystemInfo),
      });
    });
  }

  getLanguagesPermissionsLive(refresh: Signal<unknown>) {
    return httpResource<SiteLanguagePermissions[]>(() => {
      refresh();
      return ({
        url: this.apiUrl(webApiAppRootLanguages),
        params: { appId: this.appId }
      });
    });
  }
}
