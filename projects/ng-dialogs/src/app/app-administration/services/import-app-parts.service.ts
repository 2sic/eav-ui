import { Context as DnnContext } from '@2sic.com/dnn-sxc-angular';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { webApiAppRoot } from '../../import-app/services/import-app.service';
import { FileUploadResult } from '../../shared/components/file-upload-dialog';
import { Context } from '../../shared/services/context';

export const webApiAppPartsRoot = 'admin/appParts/';

@Injectable()
export class ImportAppPartsService {
  constructor(private http: HttpClient, private context: Context, private dnnContext: DnnContext) { }

  importAppParts(file: File) {
    const formData = new FormData();
    formData.append('File', file);
    return this.http.post<FileUploadResult>(this.dnnContext.$2sxc.http.apiUrl(webApiAppPartsRoot + 'Import'), formData, {
      params: { appId: this.context.appId.toString(), zoneId: this.context.zoneId.toString() }
    });
  }

  /** Reset the App back to the state it was in the last xml export */
  resetApp() {
    return this.http.post<FileUploadResult>(this.dnnContext.$2sxc.http.apiUrl(webApiAppRoot + 'Reset'), {}, {
      params: { appId: this.context.appId.toString(), zoneId: this.context.zoneId.toString() }
    });
  }
}
