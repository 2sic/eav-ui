import { computed, Injectable } from '@angular/core';
import { FileUploadResult } from '../../shared/components/file-upload-dialog/file-upload-dialog.models';
import { classLog } from '../../shared/logging';
import { HttpServiceBase } from '../../shared/services/http-service-base';
import { Extension } from '../app-extensions/app-extensions.component';

@Injectable()
export class AppExtensionsService extends HttpServiceBase {
  log = classLog({ AppExtensionsService });

  // Reactive resource for loading extensions
  extensionsResource = this.newHttpResource<{ extensions: Extension[] }>(() => ({
    url: this.apiUrl('admin/app/Extensions'),
    params: { appId: this.appId },
    method: 'GET',
    credentials: 'include',
  }));

  // Computed signal for value access
  extensions = computed(() => this.extensionsResource.value()?.extensions ?? []);

  // Update config (mutations still best done via HttpClient per Angular docs)
  updateExtension(config: string) {
    return this.http.put<void>(this.apiUrl('admin/app/Extensions'), { config }, {
      params: { appId: this.appId },
      withCredentials: true
    });
  }

  // Uploads extension files
  uploadExtensions(files: File[]) {
    const formData = new FormData();
    files.forEach(file => formData.append('files', file));

    return this.http.post<FileUploadResult>(this.apiUrl('admin/app/installextension'), formData, {
      params: { appId: this.appId },
      withCredentials: true
    });
  }
}
