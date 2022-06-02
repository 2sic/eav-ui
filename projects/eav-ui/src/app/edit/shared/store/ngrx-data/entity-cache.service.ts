import { Injectable } from '@angular/core';
import { EntityCollectionServiceElementsFactory } from '@ngrx/data';
import { distinctUntilChanged, map, Observable } from 'rxjs';
import { EntityInfo } from '../../../../../../../edit-types';
import { GeneralHelpers } from '../../helpers';
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

  getEntities(guids?: string[]): EntityInfo[] {
    if (guids == null) {
      return this.cache$.value;
    }

    return this.cache$.value.filter(entity => guids.includes(entity.Value));
  }

  getEntity(guid: string): EntityInfo {
    return this.cache$.value.find(entity => entity.Value === guid);
  }
}
