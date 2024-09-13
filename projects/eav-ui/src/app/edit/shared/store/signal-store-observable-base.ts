import { toObservable } from '@angular/core/rxjs-interop';
import { SignalStoreBase } from './signal-store-base';
import { Observable } from 'rxjs';
import { mapUntilChanged } from '../../../shared/rxJs/mapUntilChanged';

export abstract class SignalStoreObservableBase<TKey extends string | number, TValue> extends SignalStoreBase<TKey, TValue> {

  /** Old / existing functionality with observables */
  #cache$ = toObservable(this.cache);

  #list$ = toObservable(this.list);

  // publish only as a read-only signal
  protected get cache$(): Observable<Record<TKey, TValue>> {
    return this.#cache$;
  }

  protected get list$(): Observable<TValue[]> {
    return this.#list$;
  }

  getList$(): Observable<TValue[]> {
    return this.list$;
  }

  getMany$(ids?: TKey[]): Observable<TValue[]> {
    return this.cache$.pipe(
      mapUntilChanged(obj => ids.map(id => obj[id]).filter(m => m != null)),
    );
  }

}