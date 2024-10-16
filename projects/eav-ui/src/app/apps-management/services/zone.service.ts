import { Injectable } from '@angular/core';
import { webApiAppRoot } from '../../import-app/services/import-app.service';
import { HttpServiceBase } from '../../shared/services/http-service-base';
import { SiteLanguage, SiteLanguagePermissions } from '../models/site-language.model';
import { SystemInfoSet } from '../models/system-info.model';

const webApiZoneRoot = 'admin/zone/';

@Injectable()
export class ZoneService extends HttpServiceBase {

  getLanguages() {
    return this.getHttpApiUrl<SiteLanguage[]>(webApiZoneRoot + 'GetLanguages');
  }

  toggleLanguage(code: string, enable: boolean) {
    return this.getHttpApiUrl<null>(webApiZoneRoot + 'SwitchLanguage', {
      params: { cultureCode: code, enable: enable.toString() },
    });
  }

  getSystemInfo() {
    return this.getHttpApiUrl<SystemInfoSet>(webApiZoneRoot + 'GetSystemInfo');
  }

  getLanguagesPermissions() {
    return this.getHttpApiUrl<SiteLanguagePermissions[]>(webApiAppRoot + 'languages', {
      params: { appId: this.appId },
    });
  }
}
