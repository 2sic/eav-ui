import { Injectable } from '@angular/core';
import { FileUploadResult } from '../../../shared/components/file-upload-dialog';
import { HttpServiceBase } from '../../../shared/services/http-service-base';

const webApiTypeRootJsonBundleExport = 'admin/type/JsonBundleExport';
const webApiTypeRootJsonBundleSave = 'admin/type/BundleSave'; // not Working
const webApiTypeRootJsonBundleRestore = 'admin/type/BundleRestore'; // not Working

const webApiTypeImport = 'admin/type/BundleImport'; // not Working

@Injectable()
export class DataBundlesService extends HttpServiceBase {

  import(files: File[]) {
    const formData = new FormData();
    for (const file of files) {
      formData.append('File', file);
    }
    return this.http.post<FileUploadResult>(this.apiUrl(webApiTypeImport), formData, {
      params: { appId: this.appId, zoneId: this.zoneId },
    });
  }

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
    const url = this.apiUrl(webApiTypeRootJsonBundleRestore)
      + '?appId=' + this.appId
      + '&exportConfiguration=' + Guid
      + '&indentation=' + 1;
    window.open(url, '_blank', '');
  }

}
