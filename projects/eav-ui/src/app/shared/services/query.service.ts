import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { classLog } from '../../../../../shared/logging';
import { QueryStreams } from '../models/query-stream.model';
import { Context } from './context';

const logSpecs = {
  all: false,
  getAvailableEntities: false,
  getEntities: false,
};

@Injectable()
export class QueryService {

  log = classLog({QueryService}, logSpecs);

  constructor(private http: HttpClient, private context: Context) { }

  getFromQuery(queryUrl: string, params: string, fields: string, entitiesFilter?: string[]): Observable<QueryStreams> {
    this.log.fnIf('getAvailableEntities', { queryUrl, params, fields, entitiesFilter });
    // Check if any params we should auto-add are already set (like in a query which has these params set in the configuration)
    const hasParams = !!params;
    const paramsLower = params?.toLocaleLowerCase() ?? '';
    const hasAppId = paramsLower.includes('appid=') ?? false;
    const allParams = ''
      + (hasAppId ? '' : `&appId=${this.context.appId}`)
      + (hasParams ? `&${params}` : '')
      + '&$select=' + (fields ?? '' /* special catch to avoid the word "null" */);
    // trim initial & because it will always start with an & and it should't
    const urlParams = allParams.substring(1);
    return this.http.post<QueryStreams>(`app/auto/query/${queryUrl}?${urlParams}`,
      {
        Guids: entitiesFilter,
      },
    );
  }

  getEntities({ contentTypes, itemIds, fields, log }: { contentTypes: string[]; itemIds: string[]; fields: string; log: string }): Observable<QueryStreams> {
    this.log.fnIf(`getEntities`, { log, contentTypes, itemIds, fields });
    const allParams =
      '&typeNames=' + (contentTypes?.join(',') ?? '')
      + `&appId=${this.context.appId}`
      + '&$select=' + (fields ?? '' /* special catch to avoid the word "null" */);
    // trim initial & because it will always start with an & and it should't
    const urlParams = allParams.substring(1);
    return this.http.post<QueryStreams>(
      `app/auto/query/System.EntityPicker/Default?${urlParams}`,
      { Guids: itemIds} // 2dg Guids must be in the body as an array (API filter & too many IDs for URL parameters).
    );
  }
}
