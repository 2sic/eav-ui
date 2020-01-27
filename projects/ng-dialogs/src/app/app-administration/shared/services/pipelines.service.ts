import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { Context } from '../../../shared/context/context';
import { Query } from '../models/query.model';

@Injectable()
export class PipelinesService {
  constructor(
    private http: HttpClient,
    private context: Context,
  ) { }

  getAll(contentType: string) {
    return <Observable<Query[]>>(
      this.http.get(`/desktopmodules/2sxc/api/eav/Entities/GetEntities?appId=${this.context.appId}&contentType=${contentType}`)
    );
  }

  delete(id: number) {
    return <Observable<boolean>>(
      this.http.get('/desktopmodules/2sxc/api/eav/PipelineDesigner/DeletePipeline', {
        params: { appId: this.context.appId.toString(), Id: id.toString() },
      })
    );
  }
}
