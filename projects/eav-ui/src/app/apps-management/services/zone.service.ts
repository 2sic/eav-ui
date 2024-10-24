import { Injectable } from '@angular/core';
import { HttpServiceBase } from '../../shared/services/http-service-base';
import { SiteLanguage, SiteLanguagePermissions } from '../models/site-language.model';
import { SystemInfoSet } from '../models/system-info.model';

const webApiZoneRootGetLanguages = 'admin/zone/GetLanguages';
const webApiZoneRootSwitchLanguage = 'admin/zone/SwitchLanguage';
const webApiZoneRootGetSystemInfo = 'admin/zone/GetSystemInfo';
const webApiAppRootRootlanguages = 'admin/app/languages';

@Injectable()
export class ZoneService extends HttpServiceBase {

  getLanguage(initial: undefined) {
    return this.getSignal<SiteLanguage[]>(webApiZoneRootGetLanguages, {}, initial);
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

  getSystemInfo(initial: undefined) {
    return this.getSignal<SystemInfoSet>(webApiZoneRootGetSystemInfo, {}, initial);
  }

  getLanguagesPermissions(initial: undefined) {
    return this.getSignal<SiteLanguagePermissions[]>(webApiAppRootRootlanguages, {
      params: { appId: this.appId },
    }, initial);
  };
}
