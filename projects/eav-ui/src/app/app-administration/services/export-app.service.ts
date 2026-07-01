import { Injectable } from '@angular/core';
import { transient } from 'projects/core';
import { webApiAppRoot } from '../../import-app/services/import-app.service';
import { HttpServiceBaseSignal } from '../../shared/services/http-service-base-signal';
import { SysDataService } from '../../shared/services/sys-data.service';
import { AppInfo } from '../models/app-info.model';

const webApiAppRootSaveData = 'admin/app/SaveData';


@Injectable()
export class ExportAppService extends HttpServiceBaseSignal {

  #sysData = transient(SysDataService);

  getAppInfo() {
    return {
      value: this.#sysData.getFirst<AppInfo>({
        source: 'System.AppStatistics',
        params: { ZoneId: this.zoneId },
        noCamel: true,
      }),
    };
  }

  /** Generate the export app path. It can be extended with additional parameters */
  exportAppUrl() {
    return `${this.apiUrl(`${webApiAppRoot}Export`)}?appId=${this.appId}&zoneId=${this.zoneId}`;
  }
  async exportForVersionControl({ includeContentGroups, resetAppGuid, withFiles }:
    { includeContentGroups: boolean; resetAppGuid: boolean; withFiles: boolean; }): Promise<number> {
    return this.getStatusPromise(webApiAppRootSaveData, {
      params: {
        appid: this.appId,
        zoneId: this.zoneId,
        includeContentGroups: includeContentGroups.toString(),
        resetAppGuid: resetAppGuid.toString(),
        withPortalFiles: withFiles.toString(),
      },
    });
  }

}
