import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Context } from '../../../shared/context/context';

@Injectable()
export class AppsListService {
  constructor(
    private http: HttpClient,
    private context: Context,
  ) { }

  getAll() {
    return this.http.get(`/desktopmodules/2sxc/api/app-sys/system/apps?zoneId=${this.context.zoneId}`);
  }

  create(name: string) {
    return this.http.post('/desktopmodules/2sxc/api/app-sys/system/app',
      {},
      { params: { zoneId: this.context.zoneId.toString(), name: name } }
    );
  }

  delete(appId: number) {
    return this.http.get('/desktopmodules/2sxc/api/app-sys/system/deleteapp',
      { params: { zoneId: this.context.zoneId.toString(), appId: appId.toString() } }
    );
  }
}
