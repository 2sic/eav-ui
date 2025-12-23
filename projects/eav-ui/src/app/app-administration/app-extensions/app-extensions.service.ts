import { Injectable, Signal } from '@angular/core';
import { map } from 'rxjs';
import { FileUploadResult } from '../../shared/components/file-upload-dialog/file-upload-dialog.models';
import { classLog } from '../../shared/logging';
import { HttpServiceBase } from '../../shared/services/http-service-base';
import { Extension, ExtensionInspectResult, ExtensionPreflightItem } from './extension.model';

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

  getAll() {
    return this.http.get<{ extensions: Extension[] }>(this.apiUrl('admin/appExtensions/extensions'), {
      params: { appId: this.appId },
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

  /** Install a remote extension by URL - v2: POST to .InstallFrom with url(s) in body */
  installRemoteExtension(url: string, editions?: string, overwrite?: boolean) {
    // Always use array of string (even if only one for now)
    const body = [url];

    const params: any = {
      appId: this.appId,
      zoneId: this.zoneId,
      ...(editions ? { editions } : {}),
      ...(overwrite ? { overwrite } : {})
    };

    return this.http.post<boolean>(
      this.apiUrl('admin/appExtensions/InstallFrom'),
      body,
      { params }
    );
  }

  /** Preflight a remote extension by URL - v2: POST to .InstallPreflightFrom with url(s) in body */
  installPreflightExtensionFromUrl(url: string, editions?: string) {
    const body = [url];

    const params: any = {
      appId: this.appId,
      ...(editions ? { editions } : {})
    };

    return this.http.post<{ extensions: ExtensionPreflightItem[] }>(
      this.apiUrl('admin/appExtensions/InstallPreflightFrom'),
      body,
      { params }
    );
  }

  /** Uploads extension files (no change, still uses FormData) */
  uploadExtensions(file: File, editions?: string, overwrite?: boolean) {
    const formData = new FormData();
    formData.append('files', file);

    const params = {
      appId: this.appId,
      zoneId: this.zoneId,
      ...(editions ? { editions } : {}),
      ...(overwrite ? { overwrite } : {})
    };

    return this.http.post<boolean>(this.apiUrl('admin/appExtensions/install'), formData, {
      params,
    }).pipe(
      map((success: boolean): FileUploadResult => ({
        Success: success,
        Messages: success
          ? [{ MessageType: 1, Text: 'Extension uploaded successfully' }]
          : [{ MessageType: 2, Text: 'Extension upload failed' }]
      }))
    );
  }

  /** Preflight file upload (no change, still uses FormData) */
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
