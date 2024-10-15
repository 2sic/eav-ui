import { Injectable } from '@angular/core';
import { HttpServiceBase } from '../../shared/services/http-service-base';
import { ContentInfo } from '../models/content-info.model';
import { webApiAppPartsRoot } from './import-app-parts.service';

@Injectable()
export class ExportAppPartsService extends HttpServiceBase {

  // this.getAndWrite<SettingsStackItem[]>(webApiAppRoot + 'GetStack', {
  //   params: {
  //     appId: this.appId,
  //     part,
  //     ...(key && { key }),
  //     ...(view && { view }),
  //   },
  // }, stackSignal);

  getContentInfoSig(scope: string) {
    return this.getSignal<ContentInfo>(this.apiUrl(webApiAppPartsRoot + 'Get'), {
      params: { appid: this.appId, zoneId: this.zoneId, scope }
    }, undefined);
  }


  getContentInfo(scope: string) {
    return this.getHttp<ContentInfo>(this.apiUrl(webApiAppPartsRoot + 'Get'), {
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
