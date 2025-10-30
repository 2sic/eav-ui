import { HttpClient, httpResource } from '@angular/common/http';
import { Injectable, computed, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { FileUploadResult } from '../../shared/components/file-upload-dialog/file-upload-dialog.models';
import { classLog } from '../../shared/logging';
import { Context } from '../../shared/services/context';
import { Extension } from './app-extensions.component';

@Injectable()
export class AppExtensionsService {
  log = classLog({ AppExtensionsService });
  private http = inject(HttpClient);
  private context = inject(Context);

  // Reactive resource for loading extensions
  extensionsResource = httpResource<{ extensions: Extension[] }>(() => ({
    url: `/api/2sxc/admin/app/Extensions?appId=${this.context.appId}`,
    method: 'GET',
    credentials: 'include',
  }));

  // Computed signal for value access
  extensions = computed(() => this.extensionsResource.value()?.extensions ?? []);

  // Update config (mutations still best done via HttpClient per Angular docs)
  updateExtension(config: string): Observable<void> {
    const url = `/api/2sxc/admin/app/Extensions?appId=${this.context.appId}`;
    return this.http.put<void>(url, { config }, { withCredentials: true });
  }

  // Uploads extension files
  uploadExtensions(files: File[]): Observable<FileUploadResult> {
    const formData = new FormData();
    files.forEach(file => formData.append('files', file));
    console.log('Uploading files:', files);

    const url = `/api/2sxc/admin/app/installextension?appId=${this.context.appId}`;
    return this.http.post<FileUploadResult>(url, formData, { withCredentials: true });
  }
}
