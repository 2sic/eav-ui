import { signal } from '@angular/core';
import { EntityCollectionServiceBase, EntityCollectionServiceElementsFactory } from '@ngrx/data';
import { BehaviorSubject } from 'rxjs';

/**
 * Creates BehaviorSubject for cached data to be accessible in both synchronous and asynchronous manner with cache$.
 * WARNING! Do not use entities$
 */
export class BaseDataService<T> extends EntityCollectionServiceBase<T> {
  /**
   * WIP trying to support signals and observables at the same time
   */
  cache = signal<T[]>([]); // wip signals

  /** Old / existing functionality with observables */
  cache$ = new BehaviorSubject<T[]>([]);

  constructor(cacheName: string, serviceElementsFactory: EntityCollectionServiceElementsFactory) {
    super(cacheName, serviceElementsFactory);

    // doesn't need to be completed because store services are singletons that live as long as the browser tab is open
    this.entities$.subscribe(items => {
      // wip signals; ATM I believe it must happen FIRST because the observable will usually trigger
      // some effect, and then the data must already be updated
      this.cache.set(items);

      this.cache$.next(items);
    });
  }
}
