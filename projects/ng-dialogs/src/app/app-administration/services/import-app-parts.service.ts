import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Context as DnnContext } from '@2sic.com/dnn-sxc-angular';

import { Context } from '../../../shared/services/context';
import { ImportAppPartsResult } from '../models/import-app-parts.model';

@Injectable()
export class ImportAppPartsService {
  constructor(private http: HttpClient, private context: Context, private dnnContext: DnnContext) { }

  importAppParts(file: File) {
    const formData = new FormData();
    formData.append('AppId', this.context.appId.toString());
    formData.append('ZoneId', this.context.zoneId.toString());
    formData.append('File', file);
    return (
      this.http.post(this.dnnContext.$2sxc.http.apiUrl('app-sys/ImportExport/ImportContent'), formData)
    ) as Observable<ImportAppPartsResult>;
  }
}
