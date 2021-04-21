import { Injectable } from '@angular/core';
import { EntityCollectionServiceElementsFactory } from '@ngrx/data';
import { BaseDataService } from '.';
import { Feature } from '../../../../ng-dialogs/src/app/apps-management/models/feature.model';

@Injectable({ providedIn: 'root' })
export class FeatureService extends BaseDataService<Feature> {
  constructor(serviceElementsFactory: EntityCollectionServiceElementsFactory) {
    super('Feature', serviceElementsFactory);
  }

  loadFeatures(features: Feature[]): void {
    this.addAllToCache(features);
  }

  isFeatureEnabled(guid: string): boolean {
    return this.cache$.value.find(feature => feature.id === guid)?.enabled ?? false;
  }
}
