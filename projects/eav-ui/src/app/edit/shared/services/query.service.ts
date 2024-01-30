import { Context as DnnContext } from '@2sic.com/sxc-angular';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Context } from '../../../shared/services/context';
import { QueryStreams } from '../../form/fields/entity/entity-query/entity-query.models';

@Injectable()
export class QueryService {
  constructor(private http: HttpClient, private dnnContext: DnnContext, private context: Context) { }

  getAvailableEntities(queryUrl: string, includeGuid: boolean, params: string, fields: string, entitiesFilter?: string[]): Observable<QueryStreams> {
    // Check if any params we should auto-add are already set (like in a query which has these params set in the configuration)
    const hasParams = !!params;
    const paramsLower = params?.toLocaleLowerCase() ?? '';
    const hasAppId = paramsLower.includes('appid=') ?? false;
    const hasGuid = paramsLower.includes('includeguid=') ?? false;
    const allParams =
      (hasGuid ? '' : `&includeGuid=${includeGuid}`)//TODO: @SDV remove this when $select is respected
      + (hasAppId ? '' : `&appId=${this.context.appId}`)
      + (hasParams ? `&${params}` : '')
      + '&$select=' + (fields ?? "" /* special catch to avoid the word "null" */);
    // trim initial & because it will always start with an & and it should't
    const urlParams = allParams.substring(1);
    return this.http.post<QueryStreams>(
      this.dnnContext.$2sxc.http.apiUrl(`app/auto/query/${queryUrl}?${urlParams}`),
      { Guids: entitiesFilter },
    );
  }

  getEntities(contentTypes: string[], itemIds: string[], fields: string): Observable<QueryStreams> {
    const allParams = '&typeNames=' + (contentTypes?.join(',') ?? '')
      + '&itemIds=' + (itemIds?.join(',') ?? '')
      + '&includeGuid=true'//TODO: @SDV remove this when $select is respected
      + '&$select=' + fields;
    // trim initial & because it will always start with an & and it should't
    const urlParams = allParams.substring(1);
    return this.http.post<QueryStreams>(
      this.dnnContext.$2sxc.http.apiUrl(`app/auto/query/System.EntityPicker/Default?${urlParams}`),
      /*{ Guids: entitiesFilter },*/{}
    );
  }
}
