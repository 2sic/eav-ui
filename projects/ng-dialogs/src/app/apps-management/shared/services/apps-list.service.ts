import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Context as DnnContext } from '@2sic.com/dnn-sxc-angular';

import { Context } from '../../../shared/context/context';
import { App } from '../../../shared/models/app.model';

@Injectable()
export class AppsListService {
  constructor(private http: HttpClient, private context: Context, private dnnContext: DnnContext) { }

  getAll() {
    return <Observable<App[]>>this.http.get(this.dnnContext.$2sxc.http.apiUrl('app-sys/system/apps'), {
      params: { zoneId: this.context.zoneId.toString() }
    });
  }

  create(name: string) {
    return <Observable<null>>this.http.post(this.dnnContext.$2sxc.http.apiUrl('app-sys/system/app'), {}, {
      params: { zoneId: this.context.zoneId.toString(), name: name }
    });
  }

  delete(appId: number) {
    return <Observable<null>>this.http.get(this.dnnContext.$2sxc.http.apiUrl('app-sys/system/deleteapp'), {
      params: { zoneId: this.context.zoneId.toString(), appId: appId.toString() },
    });
  }
}
