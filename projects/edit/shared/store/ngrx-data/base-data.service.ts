import { EntityCollectionServiceBase, EntityCollectionServiceElementsFactory } from '@ngrx/data';
import { BehaviorSubject } from 'rxjs';

/**
 * Creates BehaviorSubject for cached data to be accessible in both synchronous and asynchronous manner with cache$.
 * WARNING! Do not use entities$
 */
export class BaseDataService<T> extends EntityCollectionServiceBase<T> {
  cache$: BehaviorSubject<T[]>;

  constructor(cacheName: string, serviceElementsFactory: EntityCollectionServiceElementsFactory) {
    super(cacheName, serviceElementsFactory);

    this.cache$ = new BehaviorSubject<T[]>([]);
    // doesn't need to be completed because store services are singletons that live as long as the browser tab is open
    this.entities$.subscribe(items => {
      this.cache$.next(items);
    });
  }
}
