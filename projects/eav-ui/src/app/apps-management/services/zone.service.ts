import { Injectable } from '@angular/core';
import { webApiAppRoot } from '../../import-app/services/import-app.service';
import { SiteLanguage, SiteLanguagePermissions } from '../models/site-language.model';
import { SystemInfoSet } from '../models/system-info.model';
import { HttpServiceBase } from '../../shared/services/http-service-base';

const webApiZoneRoot = 'admin/zone/';

@Injectable()
export class ZoneService extends HttpServiceBase {

  getLanguages() {
    return this.http.get<SiteLanguage[]>(this.apiUrl(webApiZoneRoot + 'GetLanguages'));
  }

  toggleLanguage(code: string, enable: boolean) {
    return this.http.get<null>(this.apiUrl(webApiZoneRoot + 'SwitchLanguage'), {
      params: { cultureCode: code, enable: enable.toString() },
    });
  }

  getSystemInfo() {
    return this.http.get<SystemInfoSet>(this.apiUrl(webApiZoneRoot + 'GetSystemInfo'));
  }

  getLanguagesPermissions() {
    return this.http.get<SiteLanguagePermissions[]>(this.apiUrl(webApiAppRoot + 'languages'), {
      params: { appId: this.appId },
    });
  }
}
