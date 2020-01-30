import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Context as DnnContext } from '@2sic.com/dnn-sxc-angular';

import { Context } from '../../../shared/context/context';
import { Query } from '../models/query.model';

@Injectable()
export class PipelinesService {
  constructor(private http: HttpClient, private context: Context, private dnnContext: DnnContext) { }

  getAll(contentType: string) {
    return <Observable<Query[]>>(
      this.http.get(this.dnnContext.$2sxc.http.apiUrl(`eav/Entities/GetEntities?appId=${this.context.appId}&contentType=${contentType}`))
    );
  }

  delete(id: number) {
    return <Observable<boolean>>this.http.get(this.dnnContext.$2sxc.http.apiUrl('eav/PipelineDesigner/DeletePipeline'), {
      params: { appId: this.context.appId.toString(), Id: id.toString() },
    });
  }
}
