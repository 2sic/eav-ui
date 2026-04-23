import { httpResource } from '@angular/common/http';
import { Injectable, Signal } from '@angular/core';
import { transient } from '../../../../../core';
import { HttpServiceBaseSignal } from '../../shared/services/http-service-base-signal';
import { SysDataService } from '../../shared/services/sys-data.service';
import { SiteLanguage, SiteLanguagePermissions } from '../models/site-language.model';
import { SystemInfoSet } from '../models/system-info.model';

const webApiZoneRootSwitchLanguage = 'admin/zone/SwitchLanguage';
const webApiZoneRootGetSystemInfo = 'admin/zone/GetSystemInfo';

@Injectable()
export class ZoneService extends HttpServiceBaseSignal {
  #sysData = transient(SysDataService);

  getLanguageLive(refresh: Signal<unknown>) {
    return this.#sysData.get<SiteLanguage>({
      refresh,
      source: 'System.SiteLanguages',
      fields: 'Code,Culture,IsEnabled,NameId',
      noCamel: true,
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
    return this.#sysData.get<SiteLanguagePermissions>({
      refresh,
      source: 'System.SiteLanguages',
      noCamel: true,
    });
  }
}
