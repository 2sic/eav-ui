import { Context as DnnContext } from '@2sic.com/dnn-sxc-angular';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ImportAppResult } from '../../import-app/models/import-app-result.model';
import { Context } from '../../shared/services/context';

export const webApiAppPartsRoot = 'admin/appParts/';

@Injectable()
export class ImportAppPartsService {
  constructor(private http: HttpClient, private context: Context, private dnnContext: DnnContext) { }

  importAppParts(file: File) {
    const formData = new FormData();
    formData.append('File', file);
    return (
      this.http.post(this.dnnContext.$2sxc.http.apiUrl(webApiAppPartsRoot + 'Import'), formData, {
        params: {
          appId: this.context.appId.toString(),
          zoneId: this.context.zoneId.toString()
        }
      })
    ) as Observable<ImportAppResult>;
  }
}
