import { httpResource } from '@angular/common/http';
import { Injectable, Signal } from '@angular/core';
import { HttpServiceBase } from '../../shared/services/http-service-base';
import { SiteLanguage, SiteLanguagePermissions } from '../models/site-language.model';
import { SystemInfoSet } from '../models/system-info.model';

const webApiZoneRootGetLanguages = 'admin/zone/GetLanguages';
const webApiZoneRootSwitchLanguage = 'admin/zone/SwitchLanguage';
const webApiZoneRootGetSystemInfo = 'admin/zone/GetSystemInfo';
const webApiAppRootRootlanguages = 'admin/app/languages';

@Injectable()
export class ZoneService extends HttpServiceBase {

  getLanguageLive(refresh: Signal<unknown>, initial: undefined = undefined) {
    return httpResource<SiteLanguage[]>(() => {
      refresh();
      return ({
        url: this.apiUrl(webApiZoneRootGetLanguages),
        params: { appId: this.appId }
      });
    }, {
      defaultValue: initial
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

  getSystemInfoLive(refresh: Signal<unknown>, initial: undefined = undefined) {
    return httpResource<SystemInfoSet>(() => {
      refresh();
      return ({
        url: this.apiUrl(webApiZoneRootGetSystemInfo),
      });
    }, {
      defaultValue: initial
    });
  }

  getLanguagesPermissionsLive(refresh: Signal<unknown>, initial: undefined = undefined) {
    return httpResource<SiteLanguagePermissions[]>(() => {
      refresh();
      return ({
        url: this.apiUrl(webApiAppRootRootlanguages),
        params: { appId: this.appId }
      });
    }, {
      defaultValue: initial
    });
  }
 
}
