import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Context as DnnContext } from '@2sic.com/dnn-sxc-angular';

import { ContentType, ContentTypeEdit } from '../models/content-type.model';
import { Context } from '../../shared/services/context';
import { EavScopeOption } from '../../shared/constants/eav.constants';

export const webApiTypeRoot = 'admin/type/';

@Injectable()
export class ContentTypesService {
  constructor(private http: HttpClient, private context: Context, private dnnContext: DnnContext) { }

  private apiUrl(name: string): string {
    return this.dnnContext.$2sxc.http.apiUrl(name);
  }

  retrieveContentType(staticName: string) {
    return this.http.get(this.apiUrl(webApiTypeRoot + 'get'), {
      params: { appId: this.context.appId.toString(), contentTypeId: staticName }
    }) as Observable<ContentType>;
  }

  retrieveContentTypes(scope: string) {
    return this.http.get(this.apiUrl(webApiTypeRoot + 'list'), {
      params: { appId: this.context.appId.toString(), scope }
    }) as Observable<ContentType[]>;
  }

  getScopes() {
    return this.http.get(this.apiUrl(webApiTypeRoot + 'scopes'), {
      params: { appId: this.context.appId.toString() }
    }).pipe(
      map((scopes: { [key: string]: string }) => {
        const scopeOptions: EavScopeOption[] = Object.keys(scopes).map(key => ({ name: scopes[key], value: key }));
        return scopeOptions;
      }),
    );
  }

  save(contentType: ContentTypeEdit) {
    return this.http.post(this.apiUrl(webApiTypeRoot + 'save'), contentType, {
      params: { appid: this.context.appId.toString() },
    }) as Observable<boolean>;
  }

  delete(contentType: ContentType) {
    return this.http.delete(this.apiUrl(webApiTypeRoot + 'delete'), {
      params: { appid: this.context.appId.toString(), staticName: contentType.StaticName },
    }) as Observable<boolean>;
  }

  createGhost(sourceStaticName: string) {
    return this.http.post(this.apiUrl(webApiTypeRoot + 'addghost'),
    null, {
      params: { appid: this.context.appId.toString(), sourceStaticName },
    }) as Observable<boolean>;
  }

  // dropped, internally it's the same as get
  // getDetails(contentTypeName: string, config: { [key: string]: string }) {
  //   return this.http.get(
  //     this.dnnContext.$2sxc.http.apiUrl(webApiTypeRoot + 'GetSingle'),
  //     { params: { ...config, appid: this.context.appId.toString(), contentTypeStaticName: contentTypeName } }
  //   ) as Observable<ContentType>;
  // }

}
