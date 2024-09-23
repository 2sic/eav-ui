import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { EavFor } from '../../edit/shared/models/eav';
import { ItemInListIdentifier } from '../models/edit-form.model';
import { webApiEntityRoot } from './entity.service';
import { HttpServiceBase } from './http-service-base';

@Injectable()
export class EntityEditService extends HttpServiceBase {

  create<T = QuickEntityResponse>(contentType: string, entity: QuickEntityRequest): Observable<T> {
    return this.http.post<T>(`app/auto/data/${contentType}`, entity, {
      params: { appId: this.appId, zoneId: this.zoneId },
    });
  }

  update<T = QuickEntityResponse>(contentType: string, entityId: number, entity: QuickEntityRequest): Observable<T> {
    return this.http.post<T>(`app/auto/data/${contentType}/${entityId}`, entity, {
      params: { appId: this.appId, zoneId: this.zoneId },
    });
  }

  delete(type: string, id: number, tryForce: boolean) {
    return this.http.delete<null>(this.apiUrl(webApiEntityRoot + 'delete'), {
      params: { contentType: type, id: id.toString(), appId: this.appId, force: tryForce.toString() },
    });
  }
}

interface QuickEntityRequest {
  /** Metadata target */
  For?: EavFor;
  /** Parent linking target (add to this entity) */
  ParentRelationship?: ItemInListIdentifier;
  [field: string]: any;
}

interface QuickEntityResponse {
  Created: string;
  Guid: string;
  Id: number;
  Modified: string;
  [field: string]: any;
}
