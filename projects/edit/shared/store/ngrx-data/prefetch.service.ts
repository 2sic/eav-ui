import { Injectable } from '@angular/core';
import { EntityCollectionServiceBase, EntityCollectionServiceElementsFactory } from '@ngrx/data';
import { Observable } from 'rxjs';
import { map, share } from 'rxjs/operators';
import { Prefetch, PrefetchLinks } from '../../../eav-item-dialog/multi-item-edit-form/multi-item-edit-form.models';

@Injectable({ providedIn: 'root' })
export class PrefetchService extends EntityCollectionServiceBase<Prefetch> {

  constructor(serviceElementsFactory: EntityCollectionServiceElementsFactory) {
    super('Prefetch', serviceElementsFactory);
  }

  loadPrefetch(prefetch: Prefetch, prefetchGuid: string): void {
    prefetch._guid = prefetchGuid;
    this.upsertOneInCache(prefetch);
  }

  getPrefetchedLinks(): Observable<PrefetchLinks> {
    return this.entities$.pipe(
      map(prefetches => {
        const links: PrefetchLinks = {};
        for (const prefetch of prefetches) {
          for (const [linkKey, linkValue] of Object.entries(prefetch.Links)) {
            links[linkKey] = linkValue;
          }
        }
        return links;
      }),
      share(),
    );
  }
}
