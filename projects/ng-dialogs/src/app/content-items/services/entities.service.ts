import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Context as DnnContext } from '@2sic.com/dnn-sxc-angular';

import { Context } from '../../shared/services/context';
import { webApiEntityRoot } from 'projects/edit';

@Injectable()
export class EntitiesService {
  constructor(private http: HttpClient, private context: Context, private dnnContext: DnnContext) { }

  delete(type: string, id: number, tryForce: boolean) {
    return this.http.get(this.dnnContext.$2sxc.http.apiUrl(webApiEntityRoot + 'delete'), {
      params: { contentType: type, id: id.toString(), appId: this.context.appId.toString(), force: tryForce.toString() },
    }) as Observable<null>;
  }
}
