import { httpResource } from '@angular/common/http';
import { computed, Injectable, Signal } from '@angular/core';
import { map } from 'rxjs';
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
//TODO: 2dg change httpRe
@Injectable()
export class ContentTypesService extends HttpServiceBase {

  // TODO getHttpApiUrl
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
      url: this.apiUrl(webApiTypeGet),
      params: { appId: this.appId, scope: scope() }
    }));
  }

  retrieveContentTypes(scope: string) {
    // TODO getHttpApiUrl
    return this.getHttpApiUrl<ContentType[]>(webApiTypes, {
      params: { appId: this.appId, scope }
    });
  }


  // TODO: remove this method after upgrade to V2
  getScopes() {
    // TODO getHttpApiUrl
    return this.getHttpApiUrl<{ old: Record<string, string>, scopes: ScopeDetailsDto[] }>(webApiTypeScopes, {
      params: { appId: this.appId }
    }).pipe(
      map(scopesData => {
        // wip during upgrade:
        const scopes = scopesData.old;
        const scopeOptions: ScopeOption[] = Object.keys(scopes).map(key => ({ name: scopes[key], value: key }));
        return scopeOptions;
      }),
    );
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

  // TODO 2dg open to use, ask 2dm
  getScopesV22() {
    const dataSignal = this.newHttpResource<{ old: Record<string, string>, scopes: ScopeDetailsDto[] }>(() => ({
      url: this.apiUrl(webApiTypeScopes),
      params: { appId: this.appId },
    }));

    // Return a computed signal that extracts just the scopes property
    return computed(() => {
      // Call the signal as a function to get its current value
      const value = dataSignal.value;
      const data = value();
      // Check if data exists before accessing properties
      if (!data) return [];
      // Now access the scopes property on the data
      return data.scopes;
    });
  }


  getScopesV2() {
    // TODO
    return this.getHttpApiUrl<{ old: Record<string, string>, scopes: ScopeDetailsDto[] }>(webApiTypeScopes, {
      params: { appId: this.appId }
    }).pipe(
      map(scopesData => scopesData.scopes),
    );
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
