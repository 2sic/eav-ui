import { Injectable } from '@angular/core';
import { EntityCollectionServiceElementsFactory } from '@ngrx/data';
import { distinctUntilChanged, map, Observable } from 'rxjs';
import { QueryEntity } from '../../entity/entity-query/entity-query.models';
import { GeneralHelpers } from '../../../../shared/helpers';
import { PickerStringQueryCacheItem } from '../../../../shared/models';
import { BaseDataService } from '../../../../shared/store/ngrx-data/base-data.service';

// TODO: @2dm - this should probably become obsolete? #cleanup-picker
@Injectable({ providedIn: 'root' })
export class StringQueryCacheService extends BaseDataService<PickerStringQueryCacheItem> {
  constructor(serviceElementsFactory: EntityCollectionServiceElementsFactory) {
    super('StringQueryCache', serviceElementsFactory);
  }

  loadEntities(entityGuid: string, fieldName: string, entities: QueryEntity[]): void {
    if (entities == null) { return; }
    const cacheItem: PickerStringQueryCacheItem = {
      selector: this.buildSelector(entityGuid, fieldName),
      entities,
    };
    this.upsertOneInCache(cacheItem);
  }

  getEntities$(entityGuid: string, fieldName: string): Observable<QueryEntity[]> {
    return this.cache$.pipe(
      map(items => items.find(item => item.selector === this.buildSelector(entityGuid, fieldName))?.entities ?? []),
      distinctUntilChanged(GeneralHelpers.arraysEqual),
    );
  }

  getEntities(entityGuid: string, fieldName: string): QueryEntity[] {
    return this.cache$.value.find(item => item.selector === this.buildSelector(entityGuid, fieldName))?.entities ?? [];
  }

  private buildSelector(entityGuid: string, fieldName: string): string {
    return `${entityGuid}|${fieldName}`;
  }
}
