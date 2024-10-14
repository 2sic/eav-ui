import { Injectable } from '@angular/core';
import { webApiAppRoot } from '../../import-app/services/import-app.service';
import { HttpServiceBase } from '../../shared/services/http-service-base';
import { AppInfo } from '../models/app-info.model';

@Injectable()
export class ExportAppService extends HttpServiceBase {

  getAppInfo() {
    return this.getHttp<AppInfo>(this.apiUrl(webApiAppRoot + 'Statistics'), {
      params: { appid: this.appId, zoneId: this.zoneId },
    });
  }

  /** Generate the export app path. It can be extended with additional parameters */
  exportAppUrl() {
    return `${this.apiUrl(`${webApiAppRoot}Export`)}?appId=${this.appId}&zoneId=${this.zoneId}`;
  }

  exportForVersionControl({ includeContentGroups, resetAppGuid, withFiles }:
    { includeContentGroups: boolean; resetAppGuid: boolean; withFiles: boolean; }) {
    // return this.get<boolean>(webApiAppRoot + 'SaveData', {
    return this.getHttp<boolean>(this.apiUrl(webApiAppRoot + 'SaveData'), {
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
