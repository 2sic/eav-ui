import { Injectable } from '@angular/core';
import { webApiAppRoot } from '../../import-app/services/import-app.service';
import { FileUploadResult } from '../../shared/components/file-upload-dialog';
import { HttpServiceBase } from '../../shared/services/http-service-base';

export const webApiAppPartsRoot = 'admin/appParts/';

@Injectable()
export class ImportAppPartsService extends HttpServiceBase {

  importAppParts(file: File) {
    const formData = new FormData();
    formData.append('File', file);
    return this.http.post<FileUploadResult>(this.apiUrl(webApiAppPartsRoot + 'Import'), formData, {
      params: { appId: this.appId, zoneId: this.zoneId }
    });
  }

  /** Reset the App back to the state it was in the last xml export */
  resetApp(withFiles: boolean) {
    return this.http.post<FileUploadResult>(this.apiUrl(webApiAppRoot + 'Reset'), {}, {
      params: {
        appId: this.appId,
        zoneId: this.zoneId,
        withPortalFiles: withFiles.toString(),
      }
    });
  }
}
