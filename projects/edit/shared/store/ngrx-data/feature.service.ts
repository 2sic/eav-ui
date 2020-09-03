import { Injectable } from '@angular/core';
import { EntityCollectionServiceBase, EntityCollectionServiceElementsFactory } from '@ngrx/data';
import { take } from 'rxjs/operators';

import { Feature } from '../../models/feature/feature';

@Injectable({ providedIn: 'root' })
export class FeatureService extends EntityCollectionServiceBase<Feature> {
  constructor(serviceElementsFactory: EntityCollectionServiceElementsFactory) {
    super('Feature', serviceElementsFactory);
  }

  public loadFeatures(features: any[]) {
    const featureList: Feature[] = Feature.createFeatureArray(features);
    this.addAllToCache(featureList);
  }

  public isFeatureEnabled(guid: string) {
    let isEnabled = false;
    this.entities$.pipe(take(1)).subscribe(features => {
      features.forEach(feature => {
        if (feature.id === guid) {
          isEnabled = feature.enabled;
        }
      });
    });
    return isEnabled;
  }
}
