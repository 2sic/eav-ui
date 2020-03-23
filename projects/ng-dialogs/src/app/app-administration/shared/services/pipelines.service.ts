import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Context as DnnContext } from '@2sic.com/dnn-sxc-angular';

import { Context } from '../../../shared/context/context';
import { Query } from '../models/query.model';
import { toBase64 } from '../../../shared/helpers/fileToBase64.helper';

@Injectable()
export class PipelinesService {
  constructor(private http: HttpClient, private context: Context, private dnnContext: DnnContext) { }

  getAll(contentType: string) {
    return this.http.get(this.dnnContext.$2sxc.http.apiUrl('eav/Entities/GetEntities'), {
      params: { appId: this.context.appId.toString(), contentType }
    }) as Observable<Query[]>;
  }

  async importQuery(file: File) {
    return this.http.post(this.dnnContext.$2sxc.http.apiUrl('eav/pipelinedesigner/importquery'), {
      AppId: this.context.appId.toString(),
      ContentBase64: await toBase64(file),
    }) as Observable<boolean>;
  }

  clonePipeline(id: number) {
    return this.http.get(this.dnnContext.$2sxc.http.apiUrl('eav/PipelineDesigner/ClonePipeline'), {
      params: { Id: id.toString(), appId: this.context.appId.toString() }
    }) as Observable<null>;
  }

  delete(id: number) {
    return this.http.get(this.dnnContext.$2sxc.http.apiUrl('eav/PipelineDesigner/DeletePipeline'), {
      params: { appId: this.context.appId.toString(), Id: id.toString() },
    }) as Observable<boolean>;
  }
}
