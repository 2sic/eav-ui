import { Injectable } from '@angular/core';
import { AdamItem } from '../../../../../../../edit-types';
import { PrefetchAdams } from '../../../dialog/main/edit-dialog-main.models';
import { AbstractControl, ValidationErrors } from '@angular/forms';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })


export class AdamCacheService /* extends BaseDataService<AdamSnapshot> Old Code */ {

  snapshot: Record<string, AdamSnapshot> = {};

  // TODO:: Old Code, remove after testing ist done
  // constructor(serviceElementsFactory: EntityCollectionServiceElementsFactory) {
  //   super('AdamCache', serviceElementsFactory);
  // }

  loadPrefetch(prefetchAdams: PrefetchAdams): void {
    if (prefetchAdams == null) { return; }

    const snapshots = Object.entries(prefetchAdams).map(([entityGuid, attributes]) => {
      const snapshot: AdamSnapshot = {
        Guid: entityGuid,
        Attributes: attributes,
      };
      return snapshot;
    });
    this.addToCache(snapshots);
  }

  getAdamSnapshot(entityGuid: string, fieldName: string): AdamItem[] {
    // TODO:: Old Code, remove after testing ist done
    // return this.cacheTemp().find(adamSnapshot => adamSnapshot.Guid === entityGuid)?.Attributes[fieldName];
    return this.snapshot[entityGuid]?.Attributes[fieldName];
  }

  private addToCache(snapshots: AdamSnapshot[]): void {
    // TODO:: Old Code, remove after testing ist done
    // this.upsertManyInCache(snapshots);
    snapshots.forEach(snapshot => {
      this.snapshot[snapshot.Guid] = snapshot;
    });
  }

  public clearCache(): void {
    this.snapshot = {};
  }

}



export interface AdamSnapshot {
  Guid: string;
  Attributes: AdamSnapshotAttributes;
}

interface AdamSnapshotAttributes {
  [name: string]: AdamItem[];
}


/** Slightly enhanced standard Abstract Control with additional warnings */
export interface AbstractControlPro extends AbstractControl {
  _warning$?: BehaviorSubject<ValidationErrors>;
}
