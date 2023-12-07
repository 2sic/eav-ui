import { Injectable } from '@angular/core';
import { EntityCollectionServiceElementsFactory } from '@ngrx/data';
import { distinctUntilChanged, map, Observable } from 'rxjs';
import { PickerItem } from '../../../../../../../edit-types';
import { GeneralHelpers } from '../../helpers';
import { BaseDataService } from './base-data.service';

@Injectable({ providedIn: 'root' })
export class EntityCacheService extends BaseDataService<PickerItem> {
  constructor(serviceElementsFactory: EntityCollectionServiceElementsFactory) {
    super('EntityCache', serviceElementsFactory);
  }

  loadEntities(entities: PickerItem[]): void {
    if (entities == null) { return; }
    this.upsertManyInCache(entities);
  }

  getEntities$(guids?: string[]): Observable<PickerItem[]> {
    if (guids == null) {
      return this.cache$.asObservable();
    }

    return this.cache$.pipe(
      map(entities => entities.filter(entity => guids.includes(entity.Value))),
      distinctUntilChanged(GeneralHelpers.arraysEqual),
    );
  }

  getEntities(guids?: string[]): PickerItem[] {
    if (guids == null) {
      return this.cache$.value;
    }

    return this.cache$.value.filter(entity => guids.includes(entity.Value));
  }

  getEntity(guid: string): PickerItem {
    return this.cache$.value.find(entity => entity.Value === guid);
  }
}
