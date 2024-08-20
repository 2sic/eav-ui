import { Injectable } from '@angular/core';
import { EntityCollectionServiceElementsFactory } from '@ngrx/data';
import { map, Observable } from 'rxjs';
import { PickerItem } from '../../picker/models/picker-item.model';
import { PrefetchEntity, prefetchItemToPickerItem } from '../../../dialog/main/edit-dialog-main.models';
import { BaseDataService } from '../../../shared/store/ngrx-data';
import { mapUntilObjChanged } from '../../../../shared/rxJs/mapUntilChanged';

@Injectable({ providedIn: 'root' })
export class PickerDataCacheService extends BaseDataService<PickerItem> {
  constructor(serviceElementsFactory: EntityCollectionServiceElementsFactory) {
    super('EntityCache', serviceElementsFactory);
  }

  loadEntities(entities: PrefetchEntity[]): void {
    if (entities == null) return;
    var asPicker = entities.map(e => prefetchItemToPickerItem(e));
    this.upsertManyInCache(asPicker);
  }

  getEntities$(guids?: string[]): Observable<PickerItem[]> {
    if (guids == null)
      return this.cache$.asObservable();

    return this.cache$.pipe(
      map(entities => entities.filter(entity => guids.includes(entity.value))),
      mapUntilObjChanged(m => m),
      // distinctUntilChanged(RxHelpers.arraysEqual),
    );
  }
}
