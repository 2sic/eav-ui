import { Injectable } from '@angular/core';
import { EntityCollectionServiceElementsFactory } from '@ngrx/data';
import { distinctUntilChanged, map, Observable } from 'rxjs';
import { QueryEntity } from '../../../form/fields/entity/entity-query/entity-query.models';
import { GeneralHelpers } from '../../helpers';
import { StringQueryCacheItem } from '../../models';
import { BaseDataService } from './base-data.service';

@Injectable({ providedIn: 'root' })
export class StringQueryCacheService extends BaseDataService<StringQueryCacheItem> {
  constructor(serviceElementsFactory: EntityCollectionServiceElementsFactory) {
    super('StringQueryCache', serviceElementsFactory);
  }

  loadEntities(entityGuid: string, fieldName: string, entities: QueryEntity[]): void {
    if (entities == null) { return; }
    const cacheItem: StringQueryCacheItem = {
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
