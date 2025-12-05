import { Injectable, Signal } from '@angular/core';
import { map } from 'rxjs';
import { FileUploadResult } from '../../shared/components/file-upload-dialog/file-upload-dialog.models';
import { classLog } from '../../shared/logging';
import { HttpServiceBase } from '../../shared/services/http-service-base';
import { Extension, ExtensionInspectResult, ExtensionPreflightItem } from '../models/extension.model';

@Injectable()
export class AppExtensionsService extends HttpServiceBase {
  log = classLog({ AppExtensionsService });

  /** Get all extensions with live refresh capability */
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

  /** Update config (mutations still best done via HttpClient per Angular docs) */
  updateConfiguration(name: string, config: string) {
    // Parse the config to JsonElement format that the API expects
    const configJson = JSON.parse(config);

    return this.http.post<boolean>(this.apiUrl('admin/appExtensions/configuration'), configJson, {
      params: {
        zoneId: this.zoneId,
        appId: this.appId,
        name
      },
    });
  }

  /** Open download link for an extension */
  downloadExtension(folder: string) {
    const params = new URLSearchParams({
      appId: this.appId,
      zoneId: this.zoneId,
      name: folder,
    });
    const url = `${this.apiUrl('admin/appExtensions/download')}?${params.toString()}`;
    window.open(url, '_blank', '');
  }

  /** Uploads extension files */
  uploadExtensions(file: File, edition?: string[]) {
    const formData = new FormData();
    formData.append('files', file);

    return this.http.post<boolean>(this.apiUrl('admin/appExtensions/install'), formData, {
      params: {
        appId: this.appId,
        zoneId: this.zoneId
      },
    }).pipe(
      map((success: boolean): FileUploadResult => ({
        Success: success,
        Messages: success
          ? [{ MessageType: 1, Text: 'Extension uploaded successfully' }] // Success message
          : [{ MessageType: 2, Text: 'Extension upload failed' }] // Error message
      }))
    );
  }

  installPreflightExtension(files: File[]) {
    const formData = new FormData();
    files.forEach(file => formData.append('files', file));
    
    return this.http.post<{ extensions: ExtensionPreflightItem[] }>(
      this.apiUrl('admin/appExtensions/installPreflight'),
      formData,
      {
        params: {
          appId: this.appId,
          zoneId: this.zoneId
        },
      }
    );
  }

  preflightExtension(name: string, edition?: string) {
    const params: { appId: string, name: string, edition?: string } = {
      appId: this.appId,
      name,
    };
    if (edition) params.edition = edition;

    return this.newHttpResource<ExtensionInspectResult>(() => ({
      url: this.apiUrl('admin/appExtensions/inspect'),
      params,
      method: 'GET',
    }));
  }

  deleteExtension(name: string, edition?: string, force = false, withData = false) {
    const params = {
      appId: this.appId,
      name,
      force,
      withData,
      ...(edition ? { edition: edition } : {})
    };

    return this.http.delete<boolean>(
      this.apiUrl('admin/appExtensions/delete'),
      { params }
    );
  }
}
