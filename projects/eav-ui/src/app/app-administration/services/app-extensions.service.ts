import { Injectable, Signal } from '@angular/core';
import { map } from 'rxjs';
import { FileUploadResult } from '../../shared/components/file-upload-dialog/file-upload-dialog.models';
import { classLog } from '../../shared/logging';
import { HttpServiceBase } from '../../shared/services/http-service-base';
import { Extension } from '../models/extension.model';

@Injectable()
export class AppExtensionsService extends HttpServiceBase {
  log = classLog({ AppExtensionsService });

  // Get all extensions with live refresh capability
  getAllLive(refresh: Signal<unknown>) {
    return this.newHttpResource<{ extensions: Extension[] }>(() => {
      // Watch the refresh signal to trigger reloads
      refresh();

      return {
        url: this.apiUrl('admin/appExtensions/extensions'),
        params: { appId: this.appId },
        method: 'GET',
      };
    });
  }

  // Update config (mutations still best done via HttpClient per Angular docs)
  updateExtension(name: string, config: string) {
    // Parse the config to JsonElement format that the API expects
    const configJson = JSON.parse(config);

    return this.http.post<boolean>(this.apiUrl('admin/appExtensions/extensions'), configJson, {
      params: {
        zoneId: this.zoneId,
        appId: this.appId,
        name
      },
    });
  }

  downloadExtension(folder: string) {
    // TODO: @2pp - Implement when API-Endpoint exists
    console.log("Downloading extension:", folder);
    
    const params = new URLSearchParams({
      appId: this.appId,
      zoneId: this.zoneId,
      name: folder,
    });
    const url = `${this.apiUrl('admin/appExtensions/download')}?${params.toString()}`;
    window.open(url, '_blank', '');

  }

  // Uploads extension files
  uploadExtensions(files: File[]) {
    const formData = new FormData();
    files.forEach(file => formData.append('files', file));

    return this.http.post<boolean>(this.apiUrl('admin/appExtensions/installExtension'), formData, {
      params: {
        appId: this.appId,
        zoneId: this.zoneId
      },
      withCredentials: true
    }).pipe(
      map((success: boolean): FileUploadResult => ({
        Success: success,
        Messages: success 
          ? [{ MessageType: 1, Text: 'Extension uploaded successfully' }] // Success message
          : [{ MessageType: 2, Text: 'Extension upload failed' }] // Error message
      }))
    );
  }
}