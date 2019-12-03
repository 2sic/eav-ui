import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable()
export class AppsListService {
  constructor(
    private http: HttpClient,
  ) { }

  getAll(zoneId: number) {
    return this.http.get(`/desktopmodules/2sxc/api/app-sys/system/apps?zoneId=${zoneId}`);
  }

  create(zoneId: number, name: string) {
    return this.http.post('/desktopmodules/2sxc/api/app-sys/system/app', {}, { params: { zoneId: zoneId.toString(), name: name } });
  }

  delete(zoneId: number, appId: number) {
    return this.http.get('/desktopmodules/2sxc/api/app-sys/system/deleteapp',
      { params: { zoneId: zoneId.toString(), appId: appId.toString() } }
    );
  }
}
