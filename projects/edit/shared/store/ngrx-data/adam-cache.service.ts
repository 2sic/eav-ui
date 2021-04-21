import { Injectable } from '@angular/core';
import { EntityCollectionServiceElementsFactory } from '@ngrx/data';
import { AdamItem } from '../../../../edit-types';
import { PrefetchAdams } from '../../../eav-item-dialog/multi-item-edit-form/multi-item-edit-form.models';
import { AdamSnapshot } from '../../models';
import { BaseDataService } from './base-data.service';

@Injectable({ providedIn: 'root' })
export class AdamCacheService extends BaseDataService<AdamSnapshot> {
  constructor(serviceElementsFactory: EntityCollectionServiceElementsFactory) {
    super('AdamCache', serviceElementsFactory);
  }

  loadPrefetch(prefetchAdams: PrefetchAdams): void {
    if (prefetchAdams == null) { return; }

    const snapshots = Object.entries(prefetchAdams).map(([entityGuid, attributes]) => {
      const snapshot: AdamSnapshot = {
        Guid: entityGuid,
        Attributes: attributes,
      };
      return snapshot;
    });
    this.upsertManyInCache(snapshots);
  }

  getAdamSnapshot(entityGuid: string, fieldName: string): AdamItem[] {
    return this.cache$.value.find(adamSnapshot => adamSnapshot.Guid === entityGuid)?.Attributes[fieldName];
  }
}
