import { httpResource } from '@angular/common/http';
import { Injectable, Signal } from '@angular/core';
import { AppInternals } from '../../app-administration/models/app-internals.model';
import { HttpServiceBase } from '../../shared/services/http-service-base';

const webApiRoot = 'admin/appinternals/get';

@Injectable()
export class AppInternalsService extends HttpServiceBase {

  /**
   * Fetches AppInternals for given key
   * @param targetType type of target metadata item is for, e.g. for Entity, or ContentType
   * @param keyType e.g. for keyType === guid, key === contentTypeStaticName
   * @param key key of target metadata item is for
   * @param contentTypeName name of content type where permissions are stored. If blank, backend returns all metadata except permissions
   */

  // TODO: 2dg remove later
  // getAppInternals(internals: AppInternals): Signal<AppInternals> {
  //   return this.getSignal<AppInternals>(webApiRoot, {
  //     params: { appid: this.appId }
  //   }, internals);
  // }

  getAppInternalsLive(refresh: Signal<unknown>, initial: AppInternals) {
    return httpResource<AppInternals>(() => {
      refresh();
      return ({
        url: this.apiUrl(webApiRoot),
        params: { appid: this.appId }
      });
    }, {
      defaultValue: initial
    });
  }

}
