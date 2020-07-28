import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Context as DnnContext } from '@2sic.com/dnn-sxc-angular';

import { QueryStreams } from '../../eav-material-controls/input-types/entity/entity-query/entity-query.models';

@Injectable()
export class QueryService {
  constructor(private http: HttpClient, private dnnContext: DnnContext) { }

  getAvailableEntities(queryUrl: string, includeGuid: boolean, params: string) {
    return this.http.get(
      this.dnnContext.$2sxc.http.apiUrl(`app/auto/query/${queryUrl}?includeGuid=${includeGuid}${params ? `&${params}` : ''}`)
    ) as Observable<QueryStreams>;
  }
}
