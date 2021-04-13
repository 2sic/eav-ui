import { Injectable } from '@angular/core';
import { EntityCollectionServiceElementsFactory } from '@ngrx/data';
import { Dictionary } from '../../../../ng-dialogs/src/app/shared/models/dictionary.model';
import { Prefetch } from '../../../eav-item-dialog/multi-item-edit-form/multi-item-edit-form.models';
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

  getPrefetchLinks(): Dictionary<string> {
    const links: Dictionary<string> = {};
    for (const prefetch of this.cache$.value) {
      for (const [linkKey, linkInfo] of Object.entries(prefetch.Links)) {
        links[linkKey] = linkInfo.Value;
      }
    }
    return links;
  }
}
