// import { Injectable } from '@angular/core';
// import { EntityCollectionServiceElementsFactory } from '@ngrx/data';
// import { distinctUntilChanged, map, Observable } from 'rxjs';
// import { QueryEntity } from '../models/query-entity.model';
// import { GeneralHelpers } from '../../../../shared/helpers';
// import { PickerStringQueryCacheItem } from '../../../../shared/models';
// import { BaseDataService } from '../../../../shared/store/ngrx-data/base-data.service';

// const logThis = true;

// // TODO: @2dm - this should probably become obsolete? #cleanup-picker
// @Injectable({ providedIn: 'root' })
// export class StringQueryCacheService extends BaseDataService<PickerStringQueryCacheItem> {
//   constructor(serviceElementsFactory: EntityCollectionServiceElementsFactory) {
//     super('StringQueryCache', serviceElementsFactory);
//   }

//   // loadEntities(entityGuid: string, fieldName: string, entities: QueryEntity[]): void {
//   //   if (entities == null) { return; }
//   //   const cacheItem: PickerStringQueryCacheItem = {
//   //     selector: this.buildSelector(entityGuid, fieldName),
//   //     entities,
//   //   };
//   //   this.upsertOneInCache(cacheItem);
//   // }

//   getEntities$(entityGuid: string, fieldName: string): Observable<QueryEntity[]> {
//     console.error('2dm - calling getEntities$');
//     return this.cache$.pipe(
//       map(items => {
//         var result = items.find(item => item.selector === this.buildSelector(entityGuid, fieldName))?.entities ?? [];
//         console.error('2dm - getEntities$ result', result);
//         return result;
//       }),
//       distinctUntilChanged(GeneralHelpers.arraysEqual),
//     );
//   }

//   // 2024-04-26 2dm removed this, don't think it's used and believe it's a leftover #cleanup-picker
//   // getEntities(entityGuid: string, fieldName: string): QueryEntity[] {
//   //   return this.cache$.value.find(item => item.selector === this.buildSelector(entityGuid, fieldName))?.entities ?? [];
//   // }

//   private buildSelector(entityGuid: string, fieldName: string): string {
//     return `${entityGuid}|${fieldName}`;
//   }
// }
