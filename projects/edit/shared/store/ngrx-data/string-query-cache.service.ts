import { Injectable } from '@angular/core';
import { EntityCollectionServiceElementsFactory } from '@ngrx/data';
import { Observable } from 'rxjs';
import { distinctUntilChanged, map } from 'rxjs/operators';
import { QueryEntity } from '../../../eav-material-controls/input-types/entity/entity-query/entity-query.models';
import { GeneralHelpers } from '../../helpers';
import { BaseDataService } from './base-data.service';

@Injectable({ providedIn: 'root' })
export class StringQueryCacheService extends BaseDataService<QueryEntity> {
  constructor(serviceElementsFactory: EntityCollectionServiceElementsFactory) {
    super('StringQueryCache', serviceElementsFactory);
  }

  loadEntities(entities: QueryEntity[]): void {
    if (entities == null) { return; }
    this.upsertManyInCache(entities);
  }

  getEntities$(guids?: string[]): Observable<QueryEntity[]> {
    if (guids == null) {
      return this.cache$.asObservable();
    }

    return this.cache$.pipe(
      map(entities => entities.filter(entity => guids.includes(entity.Guid))),
      distinctUntilChanged(GeneralHelpers.arraysEqual),
    );
  }
}
