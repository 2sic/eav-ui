import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Context as DnnContext } from '@2sic.com/dnn-sxc-angular';

import { EntityInfo } from '../models/eav/entity-info';
import { Context } from '../../../ng-dialogs/src/app/shared/services/context';

@Injectable()
export class EntityService {
  constructor(private http: HttpClient, private context: Context, private dnnContext: DnnContext) { }

  getAvailableEntities(filter: string, contentTypeName: string) {
    return this.http.post(this.dnnContext.$2sxc.http.apiUrl('eav/EntityPicker/getavailableentities'), filter, {
      params: { contentTypeName, appId: this.context.appId.toString() },
    }) as Observable<EntityInfo[]>;
  }

  delete(contentType: string, entityId: string, force: boolean) {
    return this.http.get(this.dnnContext.$2sxc.http.apiUrl('eav/entities/delete'), {
      params: { contentType, id: entityId, appId: this.context.appId.toString(), force: force.toString() },
    }) as Observable<null>;
  }
}
