import { Injectable, Signal } from '@angular/core';
import { transient } from '../../../../../core';
import { HttpServiceBaseSignal } from '../../shared/services/http-service-base-signal';
import { SysDataService } from '../../shared/services/sys-data.service';
import { SiteLanguage, SiteLanguagePermissions } from '../models/site-language.model';
import { SystemInfoStreams } from '../models/system-info.model';

const webApiZoneRootSwitchLanguage = 'admin/zone/SwitchLanguage';

@Injectable()
export class ZoneService extends HttpServiceBaseSignal {
  #sysData = transient(SysDataService);

  getLanguageLive(refresh: Signal<unknown>) {
    return this.#sysData.get<SiteLanguage>({
      refresh,
      source: 'System.ZoneLanguages',
      fields: 'Code,Culture,IsEnabled,NameId',
    });
  }

  async toggleLanguage(code: string, enable: boolean): Promise<number> {
    return this.getStatusPromise(webApiZoneRootSwitchLanguage, {
      params: { cultureCode: code, enable: enable.toString() },
    });
  }

  getSystemInfoLive(refresh: Signal<unknown>) {
    return this.#sysData.getMany<SystemInfoStreams>({
      refresh,
      source: 'System.SystemInfo',
      streams: 'Site,System,License,Messages',
      noCamel: true,
    });
  }

  getLanguagesPermissionsLive(refresh: Signal<unknown>) {
    return this.#sysData.get<SiteLanguagePermissions>({
      refresh,
      source: 'System.AppLanguages',
      noCamel: true,
      params: { appId: this.appId },
    });
  }
}
