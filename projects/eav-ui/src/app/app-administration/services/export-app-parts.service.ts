import { Injectable } from '@angular/core';
import { ContentInfo } from '../models/content-info.model';
import { webApiAppPartsRoot } from './import-app-parts.service';
import { HttpServiceBase } from '../../shared/services/http-service-base';

@Injectable()
export class ExportAppPartsService extends HttpServiceBase {

  getContentInfo(scope: string) {
    return this.http.get<ContentInfo>(this.apiUrl(webApiAppPartsRoot + 'Get'), {
      params: { appid: this.appId, zoneId: this.zoneId, scope },
    });
  }

  exportParts(contentTypeIds: number[], entityIds: number[], templateIds: number[]) {
    const url = this.apiUrl(webApiAppPartsRoot + 'Export')
      + '?appId=' + this.appId
      + '&zoneId=' + this.zoneId
      + '&contentTypeIdsString=' + contentTypeIds.join(';')
      + '&entityIdsString=' + entityIds.join(';')
      + '&templateIdsString=' + templateIds.join(';');

    window.open(url, '_blank', '');
  }
}
