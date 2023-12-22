import { Context as DnnContext } from '@2sic.com/sxc-angular';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { webApiAppRoot } from '../../import-app/services/import-app.service';
import { Context } from '../../shared/services/context';
import { AppInfo } from '../models/app-info.model';

@Injectable()
export class ExportAppService {
  constructor(private http: HttpClient, private context: Context, private dnnContext: DnnContext) { }

  getAppInfo() {
    return this.http.get<AppInfo>(this.dnnContext.$2sxc.http.apiUrl(webApiAppRoot + 'Statistics'), {
      params: { appid: this.context.appId.toString(), zoneId: this.context.zoneId.toString() },
    });
  }

  exportApp(includeContentGroups: boolean, resetAppGuid: boolean) {
    const url = this.dnnContext.$2sxc.http.apiUrl(webApiAppRoot + 'Export')
      + '?appId=' + this.context.appId
      + '&zoneId=' + this.context.zoneId
      + '&includeContentGroups=' + includeContentGroups
      + '&resetAppGuid=' + resetAppGuid;

    window.open(url, '_blank', '');
  }

  exportForVersionControl({ includeContentGroups, resetAppGuid, withFiles }:
    { includeContentGroups: boolean; resetAppGuid: boolean; withFiles: boolean; }) {
    return this.http.get<boolean>(this.dnnContext.$2sxc.http.apiUrl(webApiAppRoot + 'SaveData'), {
      params: {
        appid: this.context.appId.toString(),
        zoneId: this.context.zoneId.toString(),
        includeContentGroups: includeContentGroups.toString(),
        resetAppGuid: resetAppGuid.toString(),
        withPortalFiles: withFiles.toString(),
      },
    });
  }
}
