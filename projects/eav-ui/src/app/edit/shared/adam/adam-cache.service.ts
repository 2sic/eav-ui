import { Injectable } from '@angular/core';
import { AdamItem } from '../../../../../../edit-types';
import { PrefetchAdams } from '../../dialog/main/edit-dialog-main.models';
import { SignalStoreBase } from '../store/signal-store-base';

const logSpecs = {
  enabled: false,
  name: 'LinkCacheService',
};

@Injectable({ providedIn: 'root' })
export class AdamCacheService extends SignalStoreBase<string, AdamSnapshot> {

  constructor() {
    super(logSpecs);
  }

  override getId = (item: AdamSnapshot) => item.Guid;

  loadPrefetch(prefetchAdams: PrefetchAdams): void {
    if (prefetchAdams == null)
      return; 

    const snapshots = Object.entries(prefetchAdams)
      .map(([entityGuid, attributes]) => ({
        Guid: entityGuid,
        Attributes: attributes,
      } satisfies AdamSnapshot));
    this.addMany(snapshots);
  }

  getAdamSnapshot(entityGuid: string, fieldName: string): AdamItem[] {
    return this.cache()[entityGuid]?.Attributes[fieldName];
  }

}



interface AdamSnapshot {
  Guid: string;
  Attributes: AdamSnapshotAttributes;
}

interface AdamSnapshotAttributes {
  [name: string]: AdamItem[];
}
