import { Context as DnnContext } from '@2sic.com/dnn-sxc-angular';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ImportAppResult } from '../../import-app/models/import-app-result.model';
import { webApiAppRoot } from '../../import-app/services/import-app.service';
import { Context } from '../../shared/services/context';

export const webApiAppPartsRoot = 'admin/appParts/';

@Injectable()
export class ImportAppPartsService {
  constructor(private http: HttpClient, private context: Context, private dnnContext: DnnContext) { }

  importAppParts(file: File) {
    const formData = new FormData();
    formData.append('File', file);
    return this.http.post(this.dnnContext.$2sxc.http.apiUrl(webApiAppPartsRoot + 'Import'), formData, {
      params: { appId: this.context.appId.toString(), zoneId: this.context.zoneId.toString() }
    }) as Observable<ImportAppResult>;
  }

  /**
   * Reset the app back to the state it was in the last xml export
   */
  resetApp() {
    const ctx = this.context;
    const url = this.dnnContext.$2sxc.http.apiUrl(webApiAppRoot + `Reset?zoneid=${ctx.zoneId}&appid=${ctx.appId}`);
    return this.http.post(url, { }) as Observable<ImportAppResult>;
  }

}
