import { Context as DnnContext } from '@2sic.com/dnn-sxc-angular';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { webApiEntityRoot } from 'projects/edit';
import { Observable } from 'rxjs';
import { Context } from '../../shared/services/context';

@Injectable()
export class EntitiesService {
  constructor(private http: HttpClient, private context: Context, private dnnContext: DnnContext) { }

  delete(type: string, id: number, tryForce: boolean) {
    return this.http.delete(this.dnnContext.$2sxc.http.apiUrl(webApiEntityRoot + 'delete'), {
      params: { contentType: type, id: id.toString(), appId: this.context.appId.toString(), force: tryForce.toString() },
    }) as Observable<null>;
  }
}
