import { Context as DnnContext } from '@2sic.com/sxc-angular';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { EavFor } from '../../edit/shared/models/eav';
import { ItemInListIdentifier } from '../models/edit-form.model';
import { Context } from './context';
import { webApiEntityRoot } from './entity.service';

@Injectable()
export class EntityEditService {
  constructor(private http: HttpClient, private context: Context, private dnnContext: DnnContext) { }

  create<T = QuickEntityResponse>(contentType: string, entity: QuickEntityRequest): Observable<T> {
    return this.http.post<T>(`app/auto/data/${contentType}`, entity, {
      params: { appId: this.context.appId, zoneId: this.context.zoneId },
    });
  }

  update<T = QuickEntityResponse>(contentType: string, entityId: number, entity: QuickEntityRequest): Observable<T> {
    return this.http.post<T>(`app/auto/data/${contentType}/${entityId}`, entity, {
      params: { appId: this.context.appId, zoneId: this.context.zoneId },
    });
  }

  delete(type: string, id: number, tryForce: boolean) {
    return this.http.delete<null>(this.dnnContext.$2sxc.http.apiUrl(webApiEntityRoot + 'delete'), {
      params: { contentType: type, id: id.toString(), appId: this.context.appId.toString(), force: tryForce.toString() },
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