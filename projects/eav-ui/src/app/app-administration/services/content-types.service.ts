import { Context as DnnContext } from '@2sic.com/sxc-angular';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs';
import { FileUploadResult } from '../../shared/components/file-upload-dialog';
import { ScopeOption } from '../../shared/constants/eav.constants';
import { Context } from '../../shared/services/context';
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
export class ContentTypesService {
  constructor(private http: HttpClient, private context: Context, private dnnContext: DnnContext) { }

  private apiUrl(name: string) {
    return this.dnnContext.$2sxc.http.apiUrl(name);
  }

  retrieveContentType(staticName: string) {
    return this.http.get<ContentType>(this.apiUrl(webApiTypeGet), {
      params: { appId: this.context.appId.toString(), contentTypeId: staticName }
    });
  }

  retrieveContentTypes(scope: string) {
    return this.http.get<ContentType[]>(this.apiUrl(webApiTypes), {
      params: { appId: this.context.appId.toString(), scope }
    });
  }

  // TODO: remove this method after upgrade to V2
  getScopes() {
    return this.http.get<{ old: Record<string, string>, scopes: ScopeDetailsDto[] }>(this.apiUrl(webApiTypeScopes), {
      params: { appId: this.context.appId.toString() }
    }).pipe(
      map(scopesData => {
        // wip during upgrade:
        const scopes = scopesData.old;
        const scopeOptions: ScopeOption[] = Object.keys(scopes).map(key => ({ name: scopes[key], value: key }));
        return scopeOptions;
      }),
    );
  }

  getScopesV2() {
    return this.http.get<{ old: Record<string, string>, scopes: ScopeDetailsDto[] }>(this.apiUrl(webApiTypeScopes), {
      params: { appId: this.context.appId.toString() }
    }).pipe(
      map(scopesData => scopesData.scopes),
    );
  }

  save(contentType: ContentTypeEdit) {
    return this.http.post<boolean>(this.apiUrl(webApiTypeSave), contentType, {
      params: { appid: this.context.appId.toString() },
    });
  }

  delete(contentType: ContentType) {
    return this.http.delete<boolean>(this.apiUrl(webApiTypeDelete), {
      params: { appid: this.context.appId.toString(), staticName: contentType.StaticName },
    });
  }

  import(files: File[]) {
    const formData = new FormData();
    for (const file of files) {
      formData.append('File', file);
    }
    return this.http.post<FileUploadResult>(this.apiUrl(webApiTypeImport), formData, {
      params: { appId: this.context.appId.toString(), zoneId: this.context.zoneId.toString() }
    });
  }

  createGhost(sourceStaticName: string) {
    return this.http.post<boolean>(this.apiUrl(webApiTypeAddGhost), null, {
      params: { appid: this.context.appId.toString(), sourceStaticName },
    });
  }
}
