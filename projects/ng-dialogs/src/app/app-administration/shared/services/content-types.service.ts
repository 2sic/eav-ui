import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { ContentTypeEditExtended } from '../models/content-type-edit.model';

@Injectable()
export class ContentTypesService {
  constructor(
    private http: HttpClient,
  ) { }

  retrieveContentTypes(appId: number, scope: string) {
    return this.http.get(`/desktopmodules/2sxc/api/eav/contenttype/get/?appId=${appId}&scope=${scope}`);
  }

  save(contentType: ContentTypeEditExtended, appId: number) {
    return this.http.post('/desktopmodules/2sxc/api/eav/contenttype/save/', contentType, { params: { appid: appId.toString() } });
  }

}
