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

@Injectable()
export class ContentTypesService extends HttpServiceBase {

  retrieveContentType(staticName: string) {
    return this.getHttpApiUrl<ContentType>(webApiTypeGet, {
      params: { appId: this.appId, contentTypeId: staticName }
    });
  }

  retrieveContentTypeSig(staticName: string, initial: undefined): Signal<ContentType> {
    return this.getSignal<ContentType>(webApiTypeGet, {
      params: { appId: this.appId, contentTypeId: staticName }
    }, initial);
  }

  retrieveContentTypes(scope: string) {
    return this.getHttpApiUrl<ContentType[]>(webApiTypes, {
      params: { appId: this.appId, scope }
    });
  }

  retrieveContentTypesSig(scope: string, initial: undefined): Signal<ContentType[]> {
    return this.getSignal<ContentType[]>(webApiTypes, {
      params: { appId: this.appId, scope }
    }, initial);
  }

  // TODO: remove this method after upgrade to V2
  getScopes() {
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

  getScopesSig(initial: undefined): Signal<ScopeOption[]> {
    const scopesSignal = this.getSignal<{ old: Record<string, string>, scopes: ScopeDetailsDto[] }>(
      webApiTypeScopes,
      { params: { appId: this.appId } }, initial,
    );

    const scopeOptionsSignal = computed(() => {
      const scopesData = scopesSignal();

      // Add null/undefined check here
      if (!scopesData || !scopesData.old) {
        return []; // Return an empty array or handle this case as appropriate
      }

      const scopes = scopesData.old;
      return Object.keys(scopes).map(key => ({ name: scopes[key], value: key }));
    });

    return scopeOptionsSignal;
  }


  getScopesV2() {
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
      params: { appid: this.appId, staticName: contentType.StaticName },
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

  createGhost(sourceStaticName: string) {
    return this.http.post<boolean>(this.apiUrl(webApiTypeAddGhost), null, {
      params: { appid: this.appId, sourceStaticName },
    });
  }
}
