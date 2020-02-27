import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Context as DnnContext } from '@2sic.com/dnn-sxc-angular';

import { ContentType, ContentTypeEdit } from '../models/content-type.model';
import { Context } from '../../../shared/context/context';

@Injectable()
export class ContentTypesService {
  constructor(private http: HttpClient, private context: Context, private dnnContext: DnnContext) { }

  retrieveContentType(staticName: string) {
    return <Observable<ContentType>>(
      this.http.get(this.dnnContext.$2sxc.http.apiUrl(`eav/contenttype/get/?appId=${this.context.appId}&contentTypeId=${staticName}`))
    );
  }

  retrieveContentTypes(scope: string) {
    return <Observable<ContentType[]>>(
      this.http.get(this.dnnContext.$2sxc.http.apiUrl(`eav/contenttype/get/?appId=${this.context.appId}&scope=${scope}`))
    );
  }

  save(contentType: ContentTypeEdit) {
    return <Observable<boolean>>this.http.post(this.dnnContext.$2sxc.http.apiUrl('eav/contenttype/save/'), contentType, {
      params: { appid: this.context.appId.toString() },
    });
  }

  delete(contentType: ContentType) {
    return <Observable<boolean>>this.http.get(this.dnnContext.$2sxc.http.apiUrl('eav/contenttype/delete'), {
      params: { appid: this.context.appId.toString(), staticName: contentType.StaticName },
    });
  }

  createGhost(sourceStaticName: string) {
    return <Observable<boolean>>this.http.get(this.dnnContext.$2sxc.http.apiUrl('eav/contenttype/createghost'), {
      params: { appid: this.context.appId.toString(), sourceStaticName: sourceStaticName },
    });
  }
}
