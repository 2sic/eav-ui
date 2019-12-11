import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable()
export class ContentTypesService {
  constructor(
    private http: HttpClient,
  ) { }

  retrieveContentTypes(appId: number, scope: string) {
    return this.http.get(`/desktopmodules/2sxc/api/eav/contenttype/get/?appId=${appId}&scope=${scope}`);
  }

}
