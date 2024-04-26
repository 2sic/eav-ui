import { Context as DnnContext } from '@2sic.com/sxc-angular';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { filter, map, Observable, shareReplay, switchMap } from 'rxjs';
import { EavService, QueryService } from '.';
import { EntityBasic } from '../models/entity-basic';

export const webApiEntityRoot = 'admin/entity/';
export const webApiEntityList = 'admin/entity/list';

@Injectable()
export class EntityService {
  constructor(private http: HttpClient,
    private eavService: EavService,
    private dnnContext: DnnContext,
    private queryService: QueryService) { }

  private getAvailableEntities(contentTypeName: string, entitiesFilter?: string[]): Observable<EntityBasic[]> {

    return this.queryService.getEntities({
      contentTypes: [contentTypeName],
      itemIds: entitiesFilter,
      fields: 'Id,Guid,Title',
      log: 'getAvailableEntities'
    }).pipe(
      map(data => data.Default.map(entity => ({
        Id: entity.Id,
        Guid: entity.Guid,
        // Value is old, try to remove
        Value: entity.Guid,
        Title: entity.Title,
        // Text is old, try to remove
        Text: entity.Title
      } as EntityBasic)
    )));

    // #RemoveOldEntityPicker - commented out 2024-03-05, remove ca. 2024-06-01
    // // eavConfig for edit ui and context for other calls
    // const context = this.eavService.eavConfig ?? this.context;
    // return this.http.post<PickerItem[]>(this.dnnContext.$2sxc.http.apiUrl(webApiEntityPicker), entitiesFilter, {
    //   params: {
    //     contentTypeName,
    //     appId: context.appId.toString(),
    //   },
    // });
  }

  // Experimental 2dm
  reactiveEntities(params: Observable<{ contentTypeName: string }>): Observable<EntityBasic[]> {
    return params.pipe(
      filter(p => p != null),
      switchMap(p => this.getAvailableEntities(p.contentTypeName).pipe(shareReplay(1))),
    );
  }

  delete(contentType: string, entityId: number, force: boolean, parentId?: number, parentField?: string): Observable<null> {
    return this.http.delete<null>(this.dnnContext.$2sxc.http.apiUrl(webApiEntityRoot + 'delete'), {
      params: {
        contentType,
        id: entityId.toString(),
        appId: this.eavService.eavConfig.appId,
        force: force.toString(),
        ...(parentId && { parentId: parentId.toString() }),
        ...(parentId && parentField && { parentField }),
      },
    });
  }
}
