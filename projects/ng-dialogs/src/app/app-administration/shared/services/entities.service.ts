import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Context as DnnContext } from '@2sic.com/dnn-sxc-angular';

@Injectable()
export class EntitiesService {
  constructor(private http: HttpClient, private dnnContext: DnnContext) { }

  delete(appId: number, type: string, id: number, tryForce: boolean) {
    return this.http.get(this.dnnContext.$2sxc.http.apiUrl('eav/entities/delete'), {
      params: {
        contentType: type,
        id: id.toString(),
        appId: appId.toString(),
        force: tryForce.toString(),
      },
    });
  }
}
