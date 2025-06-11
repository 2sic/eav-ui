import { httpResource } from '@angular/common/http';
import { Injectable, Signal } from '@angular/core';
import { HttpServiceBase } from '../../shared/services/http-service-base';
import { SiteLanguage, SiteLanguagePermissions } from '../models/site-language.model';
import { SystemInfoSet } from '../models/system-info.model';

const webApiZoneRootGetLanguages = 'admin/zone/GetLanguages';
const webApiZoneRootSwitchLanguage = 'admin/zone/SwitchLanguage';
const webApiZoneRootGetSystemInfo = 'admin/zone/GetSystemInfo';
const webApiAppRootLanguages = 'admin/app/languages';

@Injectable()
export class ZoneService extends HttpServiceBase {

  getLanguageLive(refresh: Signal<unknown>) {
    return httpResource<SiteLanguage[]>(() => {
      refresh();
      return ({
        url: this.apiUrl(webApiZoneRootGetLanguages),
        params: { appId: this.appId }
      });
    });
  }

  toggleLanguage(code: string, enable: boolean) {
    return this.getHttpApiUrl<null>(webApiZoneRootSwitchLanguage, {
      params: { cultureCode: code, enable: enable.toString() },
    });
  }

  // toggleLanguageSig(code: string, enable: boolean)  {
  //   return this.getSignal<null>(webApiZoneRootSwitchLanguage, {
  //     params: { cultureCode: code, enable: enable.toString() },
  //   });
  // }

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
