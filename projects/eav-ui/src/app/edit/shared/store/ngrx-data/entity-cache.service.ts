import { Injectable } from '@angular/core';
import { EntityCollectionServiceElementsFactory } from '@ngrx/data';
import { distinctUntilChanged, map, Observable } from 'rxjs';
import { WIPDataSourceItem } from '../../../../../../../edit-types';
import { GeneralHelpers } from '../../helpers';
import { BaseDataService } from './base-data.service';

@Injectable({ providedIn: 'root' })
export class EntityCacheService extends BaseDataService<WIPDataSourceItem> {
  constructor(serviceElementsFactory: EntityCollectionServiceElementsFactory) {
    super('EntityCache', serviceElementsFactory);
  }

  loadEntities(entities: WIPDataSourceItem[]): void {
    if (entities == null) { return; }
    this.upsertManyInCache(entities);
  }

  getEntities$(guids?: string[]): Observable<WIPDataSourceItem[]> {
    if (guids == null) {
      return this.cache$.asObservable();
    }

    return this.cache$.pipe(
      map(entities => entities.filter(entity => guids.includes(entity.Value))),
      distinctUntilChanged(GeneralHelpers.arraysEqual),
    );
  }

  getEntities(guids?: string[]): WIPDataSourceItem[] {
    if (guids == null) {
      return this.cache$.value;
    }

    return this.cache$.value.filter(entity => guids.includes(entity.Value));
  }

  getEntity(guid: string): WIPDataSourceItem {
    return this.cache$.value.find(entity => entity.Value === guid);
  }
}
