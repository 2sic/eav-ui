import { Injectable } from '@angular/core';
import { EntityCollectionServiceElementsFactory } from '@ngrx/data';
import { distinctUntilChanged, map, Observable } from 'rxjs';
import { PickerItem } from '../../../../../../../edit-types';
import { GeneralHelpers } from '../../helpers';
import { BaseDataService } from './base-data.service';

@Injectable({ providedIn: 'root' })
export class PickerDataCacheService extends BaseDataService<PickerItem> {
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

  // 2024-04-26 2dm removed this, don't think it's used and believe it's a leftover #cleanup-picker
  // getEntities(guids?: string[]): PickerItem[] {
  //   if (guids == null) {
  //     return this.cache$.value;
  //   }

  //   return this.cache$.value.filter(entity => guids.includes(entity.Value));
  // }

  // getEntity(guid: string): PickerItem {
  //   return this.cache$.value.find(entity => entity.Value === guid);
  // }
}
