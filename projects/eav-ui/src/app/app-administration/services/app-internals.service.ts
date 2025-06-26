import { httpResource } from '@angular/common/http';
import { Injectable, Signal } from '@angular/core';
import { AppInternals } from '../../app-administration/models/app-internals.model';
import { HttpServiceBaseSignal } from '../../shared/services/http-service-base-signal';

const webApiRoot = 'admin/appinternals/get';

@Injectable()
export class AppInternalsService extends HttpServiceBaseSignal {

  /**
   * Fetches AppInternals for given key
   * @param targetType type of target metadata item is for, e.g. for Entity, or ContentType
   * @param keyType e.g. for keyType === guid, key === contentTypeStaticName
   * @param key key of target metadata item is for
   * @param contentTypeName name of content type where permissions are stored. If blank, backend returns all metadata except permissions
   */

  getAppInternalsLive(refresh: Signal<unknown>) {
    return httpResource<AppInternals>(() => {
      refresh();
      return ({
        url: this.apiUrl(webApiRoot),
        params: { appid: this.appId }
      });
    });
  }
}
