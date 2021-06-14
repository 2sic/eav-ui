import { Context as DnnContext } from '@2sic.com/dnn-sxc-angular';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Context } from '../../../ng-dialogs/src/app/shared/services/context';
import { QueryStreams } from '../../form/fields/entity/entity-query/entity-query.models';

@Injectable()
export class QueryService {
  constructor(private http: HttpClient, private dnnContext: DnnContext, private context: Context) { }

  getAvailableEntities(queryUrl: string, includeGuid: boolean, params: string, entitiesFilter?: string[]): Observable<QueryStreams> {
    // Check if any params we should auto-add are already set (like in a query which has these params set in the configuration)
    const hasParams = !!params;
    const paramsLower = params?.toLocaleLowerCase() ?? '';
    const hasAppId = paramsLower.includes('appid=') ?? false;
    const hasGuid = paramsLower.includes('includeguid=') ?? false;
    const allParams =
      (hasGuid ? '' : `&includeGuid=${includeGuid}`)
      + (hasAppId ? '' : `&appId=${this.context.appId}`)
      + (hasParams ? `&${params}` : '');
    // trim initial & because it will always start with an & and it should't
    const urlParams = allParams.substring(1);
    return this.http.post<QueryStreams>(
      this.dnnContext.$2sxc.http.apiUrl(`app/auto/query/${queryUrl}?${urlParams}`),
      { Guids: entitiesFilter },
    );
  }
}
