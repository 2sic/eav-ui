import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { Context } from '../../../shared/context/context';
import { App } from '../../../shared/models/app.model';

@Injectable()
export class AppsListService {
  constructor(
    private http: HttpClient,
    private context: Context,
  ) { }

  getAll() {
    return <Observable<App[]>>this.http.get(`/desktopmodules/2sxc/api/app-sys/system/apps?zoneId=${this.context.zoneId}`);
  }

  create(name: string) {
    return <Observable<null>>this.http.post('/desktopmodules/2sxc/api/app-sys/system/app',
      {},
      { params: { zoneId: this.context.zoneId.toString(), name: name } }
    );
  }

  delete(appId: number) {
    return <Observable<null>>this.http.get('/desktopmodules/2sxc/api/app-sys/system/deleteapp',
      { params: { zoneId: this.context.zoneId.toString(), appId: appId.toString() } }
    );
  }
}
