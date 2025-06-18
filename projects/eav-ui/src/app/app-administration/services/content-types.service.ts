import { httpResource } from '@angular/common/http';
import { computed, Injectable, Signal } from '@angular/core';
import { FileUploadResult } from '../../shared/components/file-upload-dialog';
import { ScopeOption } from '../../shared/constants/eav.constants';
import { HttpServiceBase } from '../../shared/services/http-service-base';
import { ContentType, ContentTypeEdit } from '../models/content-type.model';
import { ScopeDetailsDto } from '../models/scopedetails.dto';

// We should list all the "full" paths here, so it's easier to find when searching for API calls
export const webApiTypeRoot = 'admin/type/';
const webApiTypeGet = 'admin/type/get';
const webApiTypes = 'admin/type/list';
const webApiTypeScopes = 'admin/type/scopes';
const webApiTypeSave = 'admin/type/save';
const webApiTypeDelete = 'admin/type/delete';
const webApiTypeImport = 'admin/type/import';
const webApiTypeAddGhost = 'admin/type/addghost';
@Injectable()
export class ContentTypesService extends HttpServiceBase {

  // TODO: @2dg, ask 2dm 
  // content-export.component.ts
  // content-import.component.ts
  // data.component.ts
  retrieveContentType(nameId: string) {
    return this.getHttpApiUrl<ContentType>(webApiTypeGet, {
      params: { appId: this.appId, contentTypeId: nameId }
    });
  }

  getType(nameId: string) {
    return httpResource<ContentType>(() => ({
      url: this.apiUrl(webApiTypeGet),
      params: { appId: this.appId, contentTypeId: nameId }
    }));
  }

  getTypes(scope: Signal<string>) {
    return httpResource<ContentType[]>(() => ({
      url: this.apiUrl(webApiTypes),
      params: { appId: this.appId, scope: scope() }
    }), {defaultValue: []});
  }

  retrieveContentTypesPromise(scope: string): Promise<ContentType[]> {
    return this.fetchPromise<ContentType[]>(webApiTypes, {
      params: { appId: this.appId, scope }
    });
  }

  getScopesPromise(): Promise<ScopeOption[]> {
    return this.fetchPromise<{ old: Record<string, string>, scopes: ScopeDetailsDto[] }>(webApiTypeScopes, {
      params: { appId: this.appId }
    }).then(scopesData => {
      const scopes = scopesData.old;
      const scopeOptions: ScopeOption[] = Object.keys(scopes).map(key => ({
        name: scopes[key],
        value: key,
      }));
      return scopeOptions;
    });
  }

  getScopesSig() {
    const scopesSignal = httpResource<{ old: Record<string, string>, scopes: ScopeDetailsDto[] }>(() => ({
      url: this.apiUrl(webApiTypeScopes),
      params: { appid: this.appId },
    }));

    const scopeOptionsSignal = computed(() => {
      // Access the value property directly without calling scopesSignal as a function
      const value = scopesSignal.value;
      const scopesData = value();

      // Add null/undefined check here
      if (!scopesData || !scopesData.old) {
        return []; // Return an empty array or handle this case as appropriate
      }

      const scopes = scopesData.old;
      return Object.keys(scopes).map(key => ({ name: scopes[key], value: key }));
    });

    return scopeOptionsSignal;
  }

  getScopesV2Promise(): Promise<ScopeDetailsDto[]> {
    return this.fetchPromise<{ old: Record<string, string>, scopes: ScopeDetailsDto[] }>(webApiTypeScopes, {
      params: { appId: this.appId }
    }).then(scopesData => scopesData.scopes);
  }

  save(contentType: ContentTypeEdit) {
    return this.http.post<boolean>(this.apiUrl(webApiTypeSave), contentType, {
      params: { appid: this.appId },
    });
  }

  delete(contentType: ContentType) {
    return this.http.delete<boolean>(this.apiUrl(webApiTypeDelete), {
      params: { appid: this.appId, staticName: contentType.NameId }, // TODO: @2pp - replace staticName with NameId
    });
  }

  import(files: File[]) {
    const formData = new FormData();
    for (const file of files) {
      formData.append('File', file);
    }
    return this.http.post<FileUploadResult>(this.apiUrl(webApiTypeImport), formData, {
      params: { appId: this.appId, zoneId: this.zoneId },
    });
  }

  createGhost(sourceNameId: string) {
    return this.http.post<boolean>(this.apiUrl(webApiTypeAddGhost), null, {
      params: { appid: this.appId, sourceNameId },
    });
  }
}
