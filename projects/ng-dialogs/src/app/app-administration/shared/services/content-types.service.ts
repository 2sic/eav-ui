import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { ContentTypeEdit, ContentType } from '../models/content-type.model';
import { Context } from '../../../shared/context/context';

@Injectable()
export class ContentTypesService {
  constructor(
    private http: HttpClient,
    private context: Context,
  ) { }

  retrieveContentTypes(scope: string) {
    return this.http.get(`/desktopmodules/2sxc/api/eav/contenttype/get/?appId=${this.context.appId}&scope=${scope}`);
  }

  save(contentType: ContentTypeEdit) {
    return this.http.post('/desktopmodules/2sxc/api/eav/contenttype/save/',
      contentType,
      { params: { appid: this.context.appId.toString() } }
    );
  }

  delete(contentType: ContentType) {
    return this.http.get('/desktopmodules/2sxc/api/eav/contenttype/delete',
      { params: { appid: this.context.appId.toString(), staticName: contentType.StaticName } }
    );
  }

}
