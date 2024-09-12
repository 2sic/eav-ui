import { Context as DnnContext } from '@2sic.com/sxc-angular';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { filter, map, Observable, shareReplay, switchMap } from 'rxjs';
import { classLog } from '../logging';
import { EntityBasic } from '../../shared/models/entity-basic';
import { QueryService } from './query.service';
import { transient } from '../../core';

const logSpecs = {
  all: false,
  getEntities: false,
  getAvailableEntities: false,
  delete: false,
};

export const webApiEntityRoot = 'admin/entity/';
export const webApiEntityList = 'admin/entity/list';

 @Injectable()
 export class EntityService {
  
  log = classLog({EntityService}, logSpecs);

  private queryService = transient(QueryService);

  constructor(private http: HttpClient, private dnnContext: DnnContext) { }

  /**
   * Get entities based on the content type name.
   * As of 2024-04-29 only used in REST API.
   * @param params
   * @returns
   */
  getEntities$(params: Observable<{ contentTypeName: string }>): Observable<EntityBasic[]> {
    this.log.fnIf('getEntities');
    return params.pipe(
      filter(p => p != null),
      switchMap(p => this.getAvailableEntities(p.contentTypeName).pipe(shareReplay(1))),
    );
  }

  private getAvailableEntities(contentTypeName: string, entitiesFilter?: string[]): Observable<EntityBasic[]> {
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
    return this.http.delete<null>(this.dnnContext.$2sxc.http.apiUrl(webApiEntityRoot + 'delete'), {
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
