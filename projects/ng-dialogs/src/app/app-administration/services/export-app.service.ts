import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Context as DnnContext } from '@2sic.com/dnn-sxc-angular';

import { Context } from '../../shared/services/context';
import { AppInfo } from '../models/app-info.model';
import { webApiAppRoot } from '../../import-app/services/import-app.service';

@Injectable()
export class ExportAppService {
  constructor(private http: HttpClient, private context: Context, private dnnContext: DnnContext) { }

  getAppInfo() {
    return this.http.get(this.dnnContext.$2sxc.http.apiUrl(webApiAppRoot + 'Statistics'), {
      params: { appid: this.context.appId.toString(), zoneId: this.context.zoneId.toString() },
    }) as Observable<AppInfo>;
  }

  exportApp(includeContentGroups: boolean, resetAppGuid: boolean) {
    const url = this.dnnContext.$2sxc.http.apiUrl(webApiAppRoot + 'Export')
      + '?appId=' + this.context.appId
      + '&zoneId=' + this.context.zoneId
      + '&includeContentGroups=' + includeContentGroups
      + '&resetAppGuid=' + resetAppGuid;

    window.open(url, '_self', '');
  }

  exportForVersionControl(includeContentGroups: boolean, resetAppGuid: boolean) {
    return this.http.get(this.dnnContext.$2sxc.http.apiUrl(webApiAppRoot + 'SaveData'), {
      params: {
        appid: this.context.appId.toString(),
        zoneId: this.context.zoneId.toString(),
        includeContentGroups: includeContentGroups.toString(),
        resetAppGuid: resetAppGuid.toString(),
      },
    }) as Observable<boolean>;
  }
}
