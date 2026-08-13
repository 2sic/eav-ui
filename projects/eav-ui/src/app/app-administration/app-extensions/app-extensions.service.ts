import { Injectable, Signal } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { transient } from 'projects/core';
import { filter, first, map } from 'rxjs';
import { classLog } from '../../../../../shared/logging';
import { FileUploadResult } from '../../shared/components/file-upload-dialog/file-upload-dialog.models';
import { HttpServiceBase } from '../../shared/services/http-service-base';
import { SysDataService } from '../../shared/services/sys-data.service';
import { Extension, ExtensionInspectResult, ExtensionPreflightItem } from './extension.model';

@Injectable()
export class AppExtensionsService extends HttpServiceBase {
  #sysData = transient(SysDataService);
  log = classLog({ AppExtensionsService });

  /** Get all extensions with live refresh capability */
  getAllLive(refresh: Signal<unknown>) {
    const extensions = this.#sysData.get<Extension>({
      refresh,
      source: 'System.AppExtensions',
    });
    return { value: extensions };
  }

  getAll() {
    const resource = this.#sysData.getMany<{ default?: Extension[]; Default?: Extension[] }>({
      source: 'System.AppExtensions',
    });
    return toObservable(resource.value, { injector: this.injector }).pipe(
      filter((result): result is { default?: Extension[]; Default?: Extension[] } => result != null),
      first(),
      map(result => ({ extensions: result.default ?? result.Default ?? [] })),
    );
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
    interface InspectStreams {
      default?: { foundLock: boolean }[];
      files?: ExtensionInspectResult['files'];
      summary?: ExtensionInspectResult['summary'][];
      contentTypes?: ExtensionInspectResult['contentTypes'];
    }

    const resource = this.#sysData.getMany<InspectStreams>({
      source: 'System.AppExtensionDetails',
      streams: '*',
      params: { ExtensionName: name, ...(edition && { Edition: edition }) },
    });
    return {
      ...resource,
      value: () => {
        const result = resource.value();
        if (!result) return undefined;
        return {
          foundLock: result.default?.[0]?.foundLock ?? false,
          files: result.files ?? [],
          summary: result.summary?.[0],
          contentTypes: result.contentTypes ?? [],
        } as ExtensionInspectResult;
      },
    };
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
