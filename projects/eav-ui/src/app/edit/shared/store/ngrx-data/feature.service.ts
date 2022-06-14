import { Injectable } from '@angular/core';
import { EntityCollectionServiceElementsFactory } from '@ngrx/data';
import { distinctUntilChanged, map, Observable } from 'rxjs';
import { BaseDataService } from '.';
import { Feature } from '../../../../apps-management/models/feature.model';

@Injectable({ providedIn: 'root' })
export class FeatureService extends BaseDataService<Feature> {
  constructor(serviceElementsFactory: EntityCollectionServiceElementsFactory) {
    super('Feature', serviceElementsFactory);
  }

  loadFeatures(features: Feature[]): void {
    this.addAllToCache(features);
  }

  getFeature(nameId: string): Feature {
    return this.cache$.value.find(feature => [feature.Guid, feature.NameId].includes(nameId));
  }

  isFeatureEnabled(nameId: string): boolean {
    return this.cache$.value.find(feature => [feature.Guid, feature.NameId].includes(nameId))?.Enabled ?? false;
  }

  isFeatureEnabled$(nameId: string): Observable<boolean> {
    return this.cache$.pipe(
      map(features => features.find(feature => [feature.Guid, feature.NameId].includes(nameId))?.Enabled ?? false),
      distinctUntilChanged(),
    );
  }
}
