import { Injectable } from '@angular/core';
import { EntityCollectionServiceBase, EntityCollectionServiceElementsFactory } from '@ngrx/data';
import { take } from 'rxjs/operators';
import { Feature } from '../../../../ng-dialogs/src/app/apps-management/models/feature.model';

@Injectable({ providedIn: 'root' })
export class FeatureService extends EntityCollectionServiceBase<Feature> {
  constructor(serviceElementsFactory: EntityCollectionServiceElementsFactory) {
    super('Feature', serviceElementsFactory);
  }

  loadFeatures(features: Feature[]) {
    this.addAllToCache(features);
  }

  isFeatureEnabled(guid: string) {
    let isEnabled = false;
    this.entities$.pipe(take(1)).subscribe(features => {
      const feature = features.find(ftr => ftr.id === guid);
      if (feature != null) {
        isEnabled = feature.enabled;
      }
    });
    return isEnabled;
  }
}
