import { Context as DnnContext } from '@2sic.com/dnn-sxc-angular';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of, switchMap } from 'rxjs';
import { FileUploadMessageTypes, FileUploadResult } from '../../shared/components/file-upload-dialog';
import { Context } from '../../shared/services/context';

export const webApiAppRoot = 'admin/app/';

@Injectable()
export class ImportAppService {
  constructor(private http: HttpClient, private context: Context, private dnnContext: DnnContext) { }

  importApp(file: File, changedName: string, retryOnDuplicate = false): Observable<FileUploadResult> {
    const formData = new FormData();
    formData.append('File', file);
    formData.append('Name', changedName ?? '');
    return this.http.post<FileUploadResult>(this.dnnContext.$2sxc.http.apiUrl(webApiAppRoot + 'Import'), formData, {
      params: { zoneId: this.context.zoneId.toString() }
    }).pipe(
      switchMap(result => {
        if (retryOnDuplicate && result.Messages[0]?.MessageType === FileUploadMessageTypes.Warning) {
          const folderName = prompt(result.Messages[0].Text + ' Would you like to install it using another folder name?');
          if (folderName) {
            return this.importApp(file, folderName, true);
          }
        }
        return of(result);
      }),
    );
  }
}
