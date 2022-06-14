import { Context as DnnContext } from '@2sic.com/dnn-sxc-angular';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs';
import { FileUploadResult } from '../../shared/components/file-upload-dialog';
import { ScopeOption } from '../../shared/constants/eav.constants';
import { Context } from '../../shared/services/context';
import { ContentType, ContentTypeEdit } from '../models/content-type.model';

export const webApiTypeRoot = 'admin/type/';

@Injectable()
export class ContentTypesService {
  constructor(private http: HttpClient, private context: Context, private dnnContext: DnnContext) { }

  private apiUrl(name: string) {
    return this.dnnContext.$2sxc.http.apiUrl(name);
  }

  retrieveContentType(staticName: string) {
    return this.http.get<ContentType>(this.apiUrl(webApiTypeRoot + 'get'), {
      params: { appId: this.context.appId.toString(), contentTypeId: staticName }
    });
  }

  retrieveContentTypes(scope: string) {
    return this.http.get<ContentType[]>(this.apiUrl(webApiTypeRoot + 'list'), {
      params: { appId: this.context.appId.toString(), scope }
    });
  }

  getScopes() {
    return this.http.get<Record<string, string>>(this.apiUrl(webApiTypeRoot + 'scopes'), {
      params: { appId: this.context.appId.toString() }
    }).pipe(
      map(scopes => {
        const scopeOptions: ScopeOption[] = Object.keys(scopes).map(key => ({ name: scopes[key], value: key }));
        return scopeOptions;
      }),
    );
  }

  save(contentType: ContentTypeEdit) {
    return this.http.post<boolean>(this.apiUrl(webApiTypeRoot + 'save'), contentType, {
      params: { appid: this.context.appId.toString() },
    });
  }

  delete(contentType: ContentType) {
    return this.http.delete<boolean>(this.apiUrl(webApiTypeRoot + 'delete'), {
      params: { appid: this.context.appId.toString(), staticName: contentType.StaticName },
    });
  }

  import(files: File[]) {
    const formData = new FormData();
    for (const file of files) {
      formData.append('File', file);
    }
    return this.http.post<FileUploadResult>(this.apiUrl(webApiTypeRoot + 'import'), formData, {
      params: { appId: this.context.appId.toString(), zoneId: this.context.zoneId.toString() }
    });
  }

  createGhost(sourceStaticName: string) {
    return this.http.post<boolean>(this.apiUrl(webApiTypeRoot + 'addghost'), null, {
      params: { appid: this.context.appId.toString(), sourceStaticName },
    });
  }
}
