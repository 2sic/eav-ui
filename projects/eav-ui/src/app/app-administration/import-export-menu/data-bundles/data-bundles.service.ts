import { Injectable } from '@angular/core';
import { HttpServiceBase } from '../../../shared/services/http-service-base';

const webApiTypeRootJsonBundleExport = 'admin/type/JsonBundleExport';
const webApiTypeRootJsonBundleSave = 'admin/type/BundleSave';

@Injectable()
export class DataBundlesService extends HttpServiceBase {

  importDataBundle(){

  }

  // TODO: @2dg
  // - one one hand, this should be in a separate service BundleService
  // - ...but: it would be better to make the service just generate the URL, and then use a link in the template directly (in a _blank window)
  exportDataBundle(Guid: string) {
    const url = this.apiUrl(webApiTypeRootJsonBundleExport)
      + '?appId=' + this.appId
      + '&exportConfiguration=' + Guid
      + '&indentation=' + 1;
    window.open(url, '_blank', '');
  }

  saveDataBundles(Guid: string) {
    const url = this.apiUrl(webApiTypeRootJsonBundleSave)
      + '?appId=' + this.appId
      + '&exportConfiguration=' + Guid
      + '&indentation=' + 1;
    window.open(url, '_blank', '');
  }

  restoreDataBundles(Guid: string) {
    const url = this.apiUrl(webApiTypeRootJsonBundleSave)
      + '?appId=' + this.appId
      + '&exportConfiguration=' + Guid
      + '&indentation=' + 1;
    window.open(url, '_blank', '');
  }

}
