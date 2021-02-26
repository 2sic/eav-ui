import { Injectable } from '@angular/core';
import { EntityCollectionServiceBase, EntityCollectionServiceElementsFactory } from '@ngrx/data';
import { BehaviorSubject } from 'rxjs';
import { Prefetch, PrefetchLinks } from '../../../eav-item-dialog/multi-item-edit-form/multi-item-edit-form.models';

@Injectable({ providedIn: 'root' })
export class PrefetchService extends EntityCollectionServiceBase<Prefetch> {
  private prefetches$: BehaviorSubject<Prefetch[]>;

  constructor(serviceElementsFactory: EntityCollectionServiceElementsFactory) {
    super('Prefetch', serviceElementsFactory);

    this.prefetches$ = new BehaviorSubject<Prefetch[]>([]);
    // doesn't need to be completed because store services are singletons that live as long as the browser tab is open
    this.entities$.subscribe(prefetches => {
      this.prefetches$.next(prefetches);
    });
  }

  loadPrefetch(prefetch: Prefetch, prefetchGuid: string): void {
    prefetch._guid = prefetchGuid;
    this.upsertOneInCache(prefetch);
  }

  getPrefetchLinks(): PrefetchLinks {
    const links: PrefetchLinks = {};
    for (const prefetch of this.prefetches$.value) {
      for (const [linkKey, linkValue] of Object.entries(prefetch.Links)) {
        links[linkKey] = linkValue;
      }
    }
    return links;
  }
}
