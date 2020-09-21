import { Context as DnnContext } from '@2sic.com/dnn-sxc-angular';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Context } from '../../shared/services/context';
import { ImportAppResult } from '../models/import-app-result.model';

export const webApiAppRoot = 'admin/app/';

@Injectable()
export class ImportAppService {
  constructor(private http: HttpClient, private context: Context, private dnnContext: DnnContext) { }

  importApp(file: File, changedName: string) {
    const formData = new FormData();
    // formData.append('AppId', this.context.appId.toString());
    // formData.append('ZoneId', this.context.zoneId.toString());
    formData.append('File', file);
    formData.append('Name', changedName ? changedName : '');
    return this.http.post(this.dnnContext.$2sxc.http.apiUrl(webApiAppRoot + 'Import'), formData,
      {
        params: {
          // appId: this.context.appId.toString(),
          zoneId: this.context.zoneId.toString(),
        }
      }) as Observable<ImportAppResult>;
  }
}
