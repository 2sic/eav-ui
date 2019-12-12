import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { ContentTypeEdit } from '../models/content-type.model';

@Injectable()
export class ContentTypesService {
  constructor(
    private http: HttpClient,
  ) { }

  retrieveContentTypes(appId: number, scope: string) {
    return this.http.get(`/desktopmodules/2sxc/api/eav/contenttype/get/?appId=${appId}&scope=${scope}`);
  }

  save(contentType: ContentTypeEdit, appId: number) {
    return this.http.post('/desktopmodules/2sxc/api/eav/contenttype/save/', contentType, { params: { appid: appId.toString() } });
  }

}
