import { httpResource } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { webApiAppRoot } from '../../import-app/services/import-app.service';
import { HttpServiceBaseSignal } from '../../shared/services/http-service-base-signal';
import { AppInfo } from '../models/app-info.model';

const webApiAppRootStatistics = 'admin/app/Statistics';
const webApiAppRootSaveData = 'admin/app/SaveData';


@Injectable()
export class ExportAppService extends HttpServiceBaseSignal {

  getAppInfo() {
    return httpResource<AppInfo>(() => ({
      url: this.apiUrl(webApiAppRootStatistics),
      params: { appid: this.appId, zoneId: this.zoneId },
    }));
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
