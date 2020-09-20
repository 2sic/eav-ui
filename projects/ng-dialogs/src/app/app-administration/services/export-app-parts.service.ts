import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Context as DnnContext } from '@2sic.com/dnn-sxc-angular';

import { Context } from '../../shared/services/context';
import { ContentInfo } from '../models/content-info.model';

@Injectable()
export class ExportAppPartsService {
  constructor(private http: HttpClient, private context: Context, private dnnContext: DnnContext) { }

  getContentInfo(scope: string) {
    return this.http.get(this.dnnContext.$2sxc.http.apiUrl('app-sys/ImportExport/GetContentInfo'), {
      params: { appid: this.context.appId.toString(), zoneId: this.context.zoneId.toString(), scope },
    }) as Observable<ContentInfo>;
  }

  exportParts(contentTypeIds: number[], entityIds: number[], templateIds: number[]) {
    const url = this.dnnContext.$2sxc.http.apiUrl('app-sys/ImportExport/ExportContent')
      + '?appId=' + this.context.appId.toString()
      + '&zoneId=' + this.context.zoneId.toString()
      + '&contentTypeIdsString=' + contentTypeIds.join(';')
      + '&entityIdsString=' + entityIds.join(';')
      + '&templateIdsString=' + templateIds.join(';');

    window.open(url, '_self', '');
  }
}
