import { Context as DnnContext } from '@2sic.com/dnn-sxc-angular';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { EntityInfo } from '../models/eav/entity-info';
import { EavService, webApiEditRoot } from './eav.service';

export const webApiEntityRoot = 'admin/entity/';
export const webApiEntityList = webApiEntityRoot + 'list';

@Injectable()
export class EntityService {
  constructor(private http: HttpClient, private eavService: EavService, private dnnContext: DnnContext) { }

  getAvailableEntities(filter: string, contentTypeName: string) {
    return this.http.post(this.dnnContext.$2sxc.http.apiUrl(webApiEditRoot + 'EntityPicker'), filter, {
      params: { contentTypeName, appId: this.eavService.eavConfig.appId.toString() },
    }) as Observable<EntityInfo[]>;
  }

  delete(contentType: string, entityId: string, force: boolean) {
    return this.http.delete(this.dnnContext.$2sxc.http.apiUrl(webApiEntityRoot + 'delete'), {
      params: { contentType, id: entityId, appId: this.eavService.eavConfig.appId.toString(), force: force.toString() },
    }) as Observable<null>;
  }
}
