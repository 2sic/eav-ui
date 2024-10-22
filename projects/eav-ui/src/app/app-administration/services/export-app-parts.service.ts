import { Injectable } from '@angular/core';
import { HttpServiceBase } from '../../shared/services/http-service-base';
import { ContentInfo } from '../models/content-info.model';
import { webApiAppPartsRoot } from './import-app-parts.service';

const webApiAppPartsGet = 'admin/appParts/get';
@Injectable()
export class ExportAppPartsService extends HttpServiceBase {

  getContentInfo(scope: string, initial: ContentInfo) {
    return this.getSignal<ContentInfo>(webApiAppPartsGet, {
      params: { appid: this.appId, zoneId: this.zoneId, scope }
    }, initial);
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
