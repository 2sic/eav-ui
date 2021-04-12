import { Injectable } from '@angular/core';
import { EntityCollectionServiceElementsFactory } from '@ngrx/data';
import { Observable } from 'rxjs';
import { distinctUntilChanged, map } from 'rxjs/operators';
import { GeneralHelpers } from '../../helpers';
import { EntityInfo } from '../../models';
import { BaseDataService } from './base-data.service';

@Injectable({ providedIn: 'root' })
export class EntityCacheService extends BaseDataService<EntityInfo> {
  constructor(serviceElementsFactory: EntityCollectionServiceElementsFactory) {
    super('EntityCache', serviceElementsFactory);
  }

  loadEntities(entities: EntityInfo[]): void {
    if (entities == null) { return; }
    this.upsertManyInCache(entities);
  }

  getEntities$(guids?: string[]): Observable<EntityInfo[]> {
    if (guids == null) {
      return this.cache$.asObservable();
    }

    return this.cache$.pipe(
      map(entities => entities.filter(entity => guids.includes(entity.Value))),
      distinctUntilChanged(GeneralHelpers.arraysEqual),
    );
  }

  getEntity(guid: string): EntityInfo {
    return this.cache$.value.find(entity => entity.Value === guid);
  }
}
