import { HttpClient, httpResource } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { FileUploadResult } from '../../shared/components/file-upload-dialog/file-upload-dialog.models';
import { classLog } from '../../shared/logging';
import { Context } from '../../shared/services/context';
import { Extension } from './app-extensions.component';

@Injectable()
export class AppExtensionsService {
  log = classLog({ AppExtensionsService });

  constructor(private http: HttpClient, private context: Context) { }

  extensionsResource = httpResource<{ extensions: Extension[] }>(() => ({
    url: `/api/2sxc/admin/app/Extensions?appId=${this.context.appId}`,
    method: 'GET',
    credentials: 'include',
  }));

  // Return an Observable<FileUploadResult> so it matches FileUploadDialogData.upload$ signature
  uploadExtensions(files: File[]): Observable<FileUploadResult> {
    const formData = new FormData();
    files.forEach(file => formData.append('files', file));
    console.log('Uploading files:', files);

    const url = `/api/2sxc/admin/app/Extensions?appId=${this.context.appId}`;
    // Adjust the generic type if your backend returns a different shape
    return this.http.post<FileUploadResult>(url, formData, { withCredentials: true });
  }
}