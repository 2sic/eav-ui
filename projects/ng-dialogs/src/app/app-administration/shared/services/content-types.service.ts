import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Context as DnnContext } from '@2sic.com/dnn-sxc-angular';

import { ContentType, ContentTypeEdit } from '../models/content-type.model';
import { Context } from '../../../shared/services/context';
import { map } from 'rxjs/operators';
import { EavScopeOption } from '../../../shared/constants/eav.constants';

@Injectable()
export class ContentTypesService {
  constructor(private http: HttpClient, private context: Context, private dnnContext: DnnContext) { }

  retrieveContentType(staticName: string) {
    return this.http.get(this.dnnContext.$2sxc.http.apiUrl('eav/contenttype/get'), {
      params: { appId: this.context.appId.toString(), contentTypeId: staticName }
    }) as Observable<ContentType>;
  }

  retrieveContentTypes(scope: string) {
    return this.http.get(this.dnnContext.$2sxc.http.apiUrl('eav/contenttype/get'), {
      params: { appId: this.context.appId.toString(), scope }
    }) as Observable<ContentType[]>;
  }

  getScopes() {
    return (this.http.get(this.dnnContext.$2sxc.http.apiUrl('eav/contenttype/scopes'), {
      params: { appId: this.context.appId.toString() }
    }) as Observable<{ [key: string]: string }>)
      .pipe(map(o => Object.keys(o).map((key) => ({ name: o[key], value: key } as EavScopeOption))));
  }


  save(contentType: ContentTypeEdit) {
    return this.http.post(this.dnnContext.$2sxc.http.apiUrl('eav/contenttype/save'), contentType, {
      params: { appid: this.context.appId.toString() },
    }) as Observable<boolean>;
  }

  delete(contentType: ContentType) {
    return this.http.get(this.dnnContext.$2sxc.http.apiUrl('eav/contenttype/delete'), {
      params: { appid: this.context.appId.toString(), staticName: contentType.StaticName },
    }) as Observable<boolean>;
  }

  createGhost(sourceStaticName: string) {
    return this.http.get(this.dnnContext.$2sxc.http.apiUrl('eav/contenttype/createghost'), {
      params: { appid: this.context.appId.toString(), sourceStaticName },
    }) as Observable<boolean>;
  }

  getDetails(contentTypeName: string, config: any) {
    return this.http.get(
      this.dnnContext.$2sxc.http.apiUrl('eav/contenttype/GetSingle'),
      // spm TODO: this code is faulty because config never gets assigned to params
      Object.assign({}, config, { params: { appid: this.context.appId, contentTypeStaticName: contentTypeName } })
    ) as Observable<any>;
  }

}
