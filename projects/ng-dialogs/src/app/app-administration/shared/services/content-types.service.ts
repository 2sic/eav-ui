import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { ContentTypeEdit, ContentType } from '../models/content-type.model';
import { Context } from '../../../shared/context/context';

@Injectable()
export class ContentTypesService {
  constructor(
    private http: HttpClient,
    private context: Context,
  ) { }

  retrieveContentTypes(scope: string) {
    return <Observable<ContentType[]>>this.http.get(
      `/desktopmodules/2sxc/api/eav/contenttype/get/?appId=${this.context.appId}&scope=${scope}`
    );
  }

  save(contentType: ContentTypeEdit) {
    return <Observable<boolean>>this.http.post(
      '/desktopmodules/2sxc/api/eav/contenttype/save/',
      contentType,
      { params: { appid: this.context.appId.toString() } }
    );
  }

  delete(contentType: ContentType) {
    return <Observable<boolean>>this.http.get(
      '/desktopmodules/2sxc/api/eav/contenttype/delete',
      { params: { appid: this.context.appId.toString(), staticName: contentType.StaticName } }
    );
  }

}
