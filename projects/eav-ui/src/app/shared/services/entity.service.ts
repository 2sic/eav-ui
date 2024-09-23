import { Injectable } from '@angular/core';
import { filter, map, Observable, shareReplay, switchMap } from 'rxjs';
import { classLog } from '../logging';
import { EntityLightIdentifier } from '../../shared/models/entity-basic';
import { QueryService } from './query.service';
import { transient } from '../../core';
import { HttpServiceBase } from './http-service-base';

const logSpecs = {
  all: false,
  getEntities: false,
  getAvailableEntities: false,
  delete: false,
};

export const webApiEntityRoot = 'admin/entity/';
export const webApiEntityList = 'admin/entity/list';

@Injectable()
export class EntityService extends HttpServiceBase {

  log = classLog({ EntityService }, logSpecs);

  private queryService = transient(QueryService);

  /**
   * Get entities based on the content type name.
   * As of 2024-04-29 only used in REST API.
   * @param params
   * @returns
   */
  getEntities$(params: Observable<{ contentTypeName: string }>): Observable<EntityLightIdentifier[]> {
    this.log.fnIf('getEntities');
    return params.pipe(
      filter(p => p != null),
      switchMap(p => this.getAvailableEntities(p.contentTypeName).pipe(shareReplay(1))),
    );
  }

  private getAvailableEntities(contentTypeName: string, entitiesFilter?: string[]): Observable<EntityLightIdentifier[]> {
    var log = this.log.fnIf('getAvailableEntities');
    return this.queryService.getEntities({
      contentTypes: [contentTypeName],
      itemIds: entitiesFilter,
      fields: 'Id,Guid,Title',
      log: 'getAvailableEntities'
    }).pipe(
      map(data => data.Default)
    );
  }

  delete(appId: number, contentType: string, entityId: number, force: boolean, parentId?: number, parentField?: string): Observable<null> {
    this.log.fnIf('delete', { appId, contentType, entityId, force, parentId, parent });
    return this.http.delete<null>(this.apiUrl(webApiEntityRoot + 'delete'), {
      params: {
        contentType,
        id: entityId.toString(),
        appId,
        force: force.toString(),
        ...(parentId && { parentId: parentId.toString() }),
        ...(parentId && parentField && { parentField }),
      },
    });
  }
}
