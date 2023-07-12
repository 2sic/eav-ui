import { Context as DnnContext } from '@2sic.com/sxc-angular';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Context } from 'projects/eav-ui/src/app/shared/services/context';
import { filter, Observable, share, switchMap } from 'rxjs';
import { EavService, webApiEntityPicker } from '.';
import { WIPDataSourceItem } from '../../../../../../edit-types';

export const webApiEntityRoot = 'admin/entity/';
export const webApiEntityList = 'admin/entity/list';

@Injectable()
export class EntityService {
  constructor(private http: HttpClient, private eavService: EavService, private context: Context, private dnnContext: DnnContext) { }

  // 2dm 2023-01-22 #maybeSupportIncludeParentApps
  getAvailableEntities(contentTypeName: string, entitiesFilter?: string[]/*, includeParentApps: boolean = null*/): Observable<WIPDataSourceItem[]> {
    // eavConfig for edit ui and context for other calls
    const context = this.eavService.eavConfig ?? this.context;
    return this.http.post<WIPDataSourceItem[]>(this.dnnContext.$2sxc.http.apiUrl(webApiEntityPicker), entitiesFilter, {
      params: {
        contentTypeName,
        appId: context.appId.toString(),
        // 2dm 2023-01-22 #maybeSupportIncludeParentApps
        // ...(includeParentApps ? { includeParentApps: includeParentApps } : {}),
      },
    });
  }

  // Experimental 2dm
  reactiveEntities(params: Observable<{ contentTypeName: string }>): Observable<WIPDataSourceItem[]> {
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
