import { Injectable } from '@angular/core';
import { EntityCollectionServiceBase, EntityCollectionServiceElementsFactory } from '@ngrx/data';
import { BehaviorSubject } from 'rxjs';
import { Feature } from '../../../../ng-dialogs/src/app/apps-management/models/feature.model';

@Injectable({ providedIn: 'root' })
export class FeatureService extends EntityCollectionServiceBase<Feature> {
  private features$: BehaviorSubject<Feature[]>;

  constructor(serviceElementsFactory: EntityCollectionServiceElementsFactory) {
    super('Feature', serviceElementsFactory);

    this.features$ = new BehaviorSubject<Feature[]>([]);
    // doesn't need to be completed because store services are singletons that live as long as the browser tab is open
    this.entities$.subscribe(features => {
      this.features$.next(features);
    });
  }

  loadFeatures(features: Feature[]): void {
    this.addAllToCache(features);
  }

  isFeatureEnabled(guid: string): boolean {
    return this.features$.value.find(feature => feature.id === guid)?.enabled ?? false;
  }
}
