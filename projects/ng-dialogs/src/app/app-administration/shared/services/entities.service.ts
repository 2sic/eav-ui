import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Context as DnnContext } from '@2sic.com/dnn-sxc-angular';

import { Context } from '../../../shared/context/context';

@Injectable()
export class EntitiesService {
  constructor(private http: HttpClient, private context: Context, private dnnContext: DnnContext) { }

  delete(type: string, id: number, tryForce: boolean) {
    return <Observable<null>>this.http.get(this.dnnContext.$2sxc.http.apiUrl('eav/entities/delete'), {
      params: {
        contentType: type,
        id: id.toString(),
        appId: this.context.appId.toString(),
        force: tryForce.toString(),
      },
    });
  }
}
