import { Context as DnnContext } from '@2sic.com/dnn-sxc-angular';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Context } from 'projects/ng-dialogs/src/app/shared/services/context';
import { Observable } from 'rxjs';
import { filter, share, switchMap } from 'rxjs/operators';
import { EntityInfo } from '../models/eav/entity-info';
import { EavService, webApiEditRoot } from './eav.service';

export const webApiEntityRoot = 'admin/entity/';
export const webApiEntityList = 'admin/entity/list';

@Injectable()
export class EntityService {
  constructor(private http: HttpClient,
    private eavService: EavService,
    // todo: SPM - this was using EavService before, but that resulted in an empty eavConfig in my code
    // so I tried context like the ContentTypeService uses and that works
    // - why? and is it bad?
    private context: Context,
    private dnnContext: DnnContext) { }

  getAvailableEntities(filter: string, contentTypeName: string) {
    return this.http.post<EntityInfo[]>(
      this.dnnContext.$2sxc.http.apiUrl(webApiEditRoot + 'EntityPicker'),
    filter,
    // TODO: SPM - CHECK
    { params: { contentTypeName, appId: this./*eavService.eavConfig*/context.appId.toString() },
    });
  }

  // Experimental 2dm
  reactiveEntities(params: Observable<{contentTypeName: string, filter: string}>) {
    return params.pipe(
      filter(p => p !== null),
      switchMap(p => this.getAvailableEntities(p.filter, p.contentTypeName).pipe(share())));
  }

  delete(contentType: string, entityId: string, force: boolean) {
    return this.http.delete(this.dnnContext.$2sxc.http.apiUrl(webApiEntityRoot + 'delete'), {
      params: { contentType, id: entityId, appId: this.eavService.eavConfig.appId.toString(), force: force.toString() },
    }) as Observable<null>;
  }
}
