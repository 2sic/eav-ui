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
  updateExtension(name: string, config: string) {
    // Parse the config to JsonElement format that the API expects
    const configJson = JSON.parse(config);

    return this.http.put<boolean>(this.apiUrl('admin/app/Extensions'), configJson, {
      params: {
        zoneId: this.zoneId,
        appId: this.appId,
        name
      },
      withCredentials: true
    });
  }

  // Uploads extension files
  uploadExtensions(name: string, files: File[]) {
    const formData = new FormData();
    files.forEach(file => formData.append('files', file));

    return this.http.post<FileUploadResult>(this.apiUrl('admin/app/installextension'), formData, {
      params: {
        appId: this.appId,
        zoneId: this.zoneId,
        name
      },
      withCredentials: true
    });
  }
}
