import { Injectable } from '@angular/core';
import { FileUploadResult } from '../../../shared/components/file-upload-dialog';
import { HttpServiceBase } from '../../../shared/services/http-service-base';

const webApiDataRootBundleImport = 'admin/data/BundleImport';
const webApiDataRootJsonBundleExport = 'admin/data/BundleExport';
const webApiDataRootBundleSave = 'admin/data/BundleSave';
const webApiDataRootBundleRestore = 'admin/data/BundleRestore';

@Injectable()
export class DataBundlesService extends HttpServiceBase {

  import(files: File[]) {
    const formData = new FormData();
    for (const file of files) {
      formData.append('File', file);
    }
    return this.http.post<FileUploadResult>(this.apiUrl(webApiDataRootBundleImport), formData, {
      params: { appId: this.appId, zoneId: this.zoneId },
    });
  }

  exportDataBundle(Guid: string) {
    const params = new URLSearchParams({
      appId: this.appId,
      exportConfiguration: Guid,
      indentation: '1',
    });
    const url = `${this.apiUrl(webApiDataRootJsonBundleExport)}?${params.toString()}`;
    window.open(url, '_blank', '');
  }

  saveDataBundles(Guid: string) {
    return this.http.get(this.apiUrl(webApiDataRootBundleSave), {
      params: {
        appId: this.appId,
        exportConfiguration: Guid,
        indentation: '1',
      },
    });
  }

  restoreDataBundles(fileName: string) {
    return this.http.get<FileUploadResult>(this.apiUrl(webApiDataRootBundleRestore), {
      params: {
        fileName: fileName,
        zoneId: this.zoneId,
        appId: this.appId,
      }
    });
  }
}
