import { httpResource } from '@angular/common/http';
import { Injectable, Signal } from '@angular/core';
import { HttpServiceBaseSignal } from '../../shared/services/http-service-base-signal';
import { ContentInfo } from '../models/content-info.model';
import { webApiAppPartsRoot } from './import-app-parts.service';

const webApiAppPartsGet = 'admin/appParts/get';
@Injectable()
export class ExportAppPartsService extends HttpServiceBaseSignal {

  getContentInfoLiveParam(scope: Signal<string>) {
    return httpResource<ContentInfo>(() => {
      return {
        url: this.apiUrl(webApiAppPartsGet),
        params: {
          appid: this.appId,
          zoneId: this.zoneId,
          scope: scope()
        }
      };
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
