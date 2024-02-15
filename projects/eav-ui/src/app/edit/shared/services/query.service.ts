import { Context as DnnContext } from '@2sic.com/sxc-angular';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Context } from '../../../shared/services/context';
import { QueryStreams } from '../../form/fields/entity/entity-query/entity-query.models';
import { ServiceBase } from '../../../shared/services/service-base';
import { EavLogger } from '../../../shared/logging/eav-logger';

const logThis = false;

@Injectable()
export class QueryService extends ServiceBase {
  constructor(private http: HttpClient, private dnnContext: DnnContext, private context: Context) {
    super(new EavLogger('QueryService', logThis));
  }

  getAvailableEntities(queryUrl: string, includeGuid: boolean, params: string, fields: string, entitiesFilter?: string[]): Observable<QueryStreams> {
    this.logger.add('getAvailableEntities', 'queryUrl', queryUrl, 'includeGuid', includeGuid, 'params', params, 'fields', fields, 'entitiesFilter', entitiesFilter);
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

  getEntities({ contentTypes, itemIds, fields, log }: { contentTypes: string[]; itemIds: string[]; fields: string; log: string }): Observable<QueryStreams> {
    this.logger.add(`getEntities(${log})`, 'contentTypes', contentTypes, 'itemIds', itemIds, 'fields', fields);
    const allParams = '&typeNames=' + (contentTypes?.join(',') ?? '')
      + '&itemIds=' + (itemIds?.join(',') ?? '')
      + '&includeGuid=true'//TODO: @SDV remove this when $select is respected
      + '&$select=' + (fields ?? "" /* special catch to avoid the word "null" */);
    // trim initial & because it will always start with an & and it should't
    const urlParams = allParams.substring(1);
    return this.http.post<QueryStreams>(
      this.dnnContext.$2sxc.http.apiUrl(`app/auto/query/System.EntityPicker/Default?${urlParams}`),
      /*{ Guids: entitiesFilter },*/{}
    );
  }
}
