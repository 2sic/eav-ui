import { Context as DnnContext } from '@2sic.com/sxc-angular';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { filter, map, Observable, shareReplay, switchMap } from 'rxjs';
import { FormConfigService, QueryService } from '.';
import { EntityBasic } from '../models/entity-basic';
import { ServiceBase } from '../../../shared/services/service-base';
import { EavLogger } from '../../../shared/logging/eav-logger';

const logThis = false;

export const webApiEntityRoot = 'admin/entity/';
export const webApiEntityList = 'admin/entity/list';

@Injectable()
export class EntityService extends ServiceBase {
  constructor(private http: HttpClient,
    private formConfig: FormConfigService,
    private dnnContext: DnnContext,
    private queryService: QueryService)
  {
    super(new EavLogger('EntityService', logThis));
  }

  /**
   * Get entities based on the content type name.
   * As of 2024-04-29 only used in REST API.
   * @param params 
   * @returns 
   */
  getEntities$(params: Observable<{ contentTypeName: string }>): Observable<EntityBasic[]> {
    return params.pipe(
      filter(p => p != null),
      switchMap(p => this.getAvailableEntities(p.contentTypeName).pipe(shareReplay(1))),
    );
  }

  private getAvailableEntities(contentTypeName: string, entitiesFilter?: string[]): Observable<EntityBasic[]> {
    var log = this.log.rxTap('getEntities', { enabled: true });
    return this.queryService.getEntities({
      contentTypes: [contentTypeName],
      itemIds: entitiesFilter,
      fields: 'Id,Guid,Title',
      log: 'getAvailableEntities'
    }).pipe(
      log.pipe(),
      map(data => data.Default)
    );
  }

  delete(contentType: string, entityId: number, force: boolean, parentId?: number, parentField?: string): Observable<null> {
    return this.http.delete<null>(this.dnnContext.$2sxc.http.apiUrl(webApiEntityRoot + 'delete'), {
      params: {
        contentType,
        id: entityId.toString(),
        appId: this.formConfig.config.appId,
        force: force.toString(),
        ...(parentId && { parentId: parentId.toString() }),
        ...(parentId && parentField && { parentField }),
      },
    });
  }
}
