import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Context } from '../../../shared/services/context';
import { QueryStreams } from '../models/query-stream.model';
import { ServiceBase } from '../../../shared/services/service-base';
import { EavLogger } from '../../../shared/logging/eav-logger';

const logThis = false;

@Injectable()
export class QueryService extends ServiceBase {
  constructor(private http: HttpClient, private context: Context) {
    super(new EavLogger('QueryService', logThis));
  }

  getAvailableEntities(queryUrl: string, includeGuid: boolean, params: string, fields: string, entitiesFilter?: string[]): Observable<QueryStreams> {
    this.log.a('getAvailableEntities', ['queryUrl', queryUrl, 'includeGuid', includeGuid, 'params', params, 'fields', fields, 'entitiesFilter', entitiesFilter]);
    // Check if any params we should auto-add are already set (like in a query which has these params set in the configuration)
    const hasParams = !!params;
    const paramsLower = params?.toLocaleLowerCase() ?? '';
    const hasAppId = paramsLower.includes('appid=') ?? false;
    const hasGuid = paramsLower.includes('includeguid=') ?? false;
    const allParams =
      '' // 2024-04-02 2dm removed now - monitor: (hasGuid ? '' : `&includeGuid=${includeGuid}`)//TODO: @SDV remove this when $select is respected
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
    this.log.a(`getEntities(${log})`, ['contentTypes', contentTypes, 'itemIds', itemIds, 'fields', fields]);
    const allParams = 
      '&typeNames=' + (contentTypes?.join(',') ?? '')
      + `&appId=${this.context.appId}`
      + '&itemIds=' + (itemIds?.join(',') ?? '')
      + '&$select=' + (fields ?? '' /* special catch to avoid the word "null" */);
    // trim initial & because it will always start with an & and it should't
    const urlParams = allParams.substring(1);
    return this.http.post<QueryStreams>(`app/auto/query/System.EntityPicker/Default?${urlParams}`,
      /*{ Guids: entitiesFilter },*/{}
    );
  }
}
