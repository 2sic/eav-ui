import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable()
export class EntitiesService {
  constructor(
    private http: HttpClient,
  ) { }

  delete(appId: number, type: string, id: number, tryForce: boolean) {
    return this.http.get('/desktopmodules/2sxc/api/eav/entities/delete', {
      params: {
        contentType: type,
        id: id.toString(),
        appId: appId.toString(),
        force: tryForce.toString(),
      }
    });
  }

}
