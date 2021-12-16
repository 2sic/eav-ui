import { Context as DnnContext } from '@2sic.com/dnn-sxc-angular';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Context } from 'projects/ng-dialogs/src/app/shared/services/context';
import { Observable } from 'rxjs';
import { filter, share, switchMap } from 'rxjs/operators';
import { EavService, webApiEditRoot } from '.';
import { EntityInfo } from '../../../edit-types';

export const webApiEntityRoot = 'admin/entity/';
export const webApiEntityList = 'admin/entity/list';

@Injectable()
export class EntityService {
  constructor(private http: HttpClient, private eavService: EavService, private context: Context, private dnnContext: DnnContext) { }

  getAvailableEntities(contentTypeName: string, entitiesFilter?: string[]): Observable<EntityInfo[]> {
    // eavConfig for edit ui and context for other calls
    const context = this.eavService.eavConfig ?? this.context;
    return this.http.post<EntityInfo[]>(this.dnnContext.$2sxc.http.apiUrl(webApiEditRoot + 'EntityPicker'), entitiesFilter, {
      params: { contentTypeName, appId: context.appId.toString() },
    });
  }

  // Experimental 2dm
  reactiveEntities(params: Observable<{ contentTypeName: string }>): Observable<EntityInfo[]> {
    return params.pipe(
      filter(p => p != null),
      switchMap(p => this.getAvailableEntities(p.contentTypeName).pipe(share())),
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
