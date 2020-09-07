import { Injectable } from '@angular/core';
import { EntityCollectionServiceBase, EntityCollectionServiceElementsFactory } from '@ngrx/data';
import { take } from 'rxjs/operators';

import { Feature } from '../../models/feature/feature';

@Injectable({ providedIn: 'root' })
export class FeatureService extends EntityCollectionServiceBase<Feature> {
  constructor(serviceElementsFactory: EntityCollectionServiceElementsFactory) {
    super('Feature', serviceElementsFactory);
  }

  loadFeatures(features: any[]) {
    const featureList: Feature[] = Feature.createFeatureArray(features);
    this.addAllToCache(featureList);
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
