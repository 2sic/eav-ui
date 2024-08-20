import { Injectable } from '@angular/core';
import { EntityCollectionServiceElementsFactory } from '@ngrx/data';
import { AdamItem } from '../../../../../../../edit-types';
import { PrefetchAdams } from '../../../dialog/main/edit-dialog-main.models';
import { BaseDataService } from './base-data.service';
import { AbstractControl, ValidationErrors } from '@angular/forms';
import { BehaviorSubject } from 'rxjs';

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
    return this.cache().find(adamSnapshot => adamSnapshot.Guid === entityGuid)?.Attributes[fieldName];
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
