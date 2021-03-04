import { Injectable } from '@angular/core';
import { EntityCollectionServiceElementsFactory } from '@ngrx/data';
import { Prefetch, PrefetchLinks } from '../../../eav-item-dialog/multi-item-edit-form/multi-item-edit-form.models';
import { BaseDataService } from './base-data.service';

@Injectable({ providedIn: 'root' })
export class PrefetchService extends BaseDataService<Prefetch> {
  constructor(serviceElementsFactory: EntityCollectionServiceElementsFactory) {
    super('Prefetch', serviceElementsFactory);
  }

  loadPrefetch(prefetch: Prefetch, prefetchGuid: string): void {
    prefetch._guid = prefetchGuid;
    this.upsertOneInCache(prefetch);
  }

  getPrefetchLinks(): PrefetchLinks {
    const links: PrefetchLinks = {};
    for (const prefetch of this.cache$.value) {
      for (const [linkKey, linkValue] of Object.entries(prefetch.Links)) {
        links[linkKey] = linkValue;
      }
    }
    return links;
  }
}
