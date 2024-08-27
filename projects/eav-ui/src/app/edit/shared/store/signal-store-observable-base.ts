import { toObservable } from '@angular/core/rxjs-interop';
import { SignalStoreBase, SignalStoreOptions } from './signal-store-base';
import { Observable } from 'rxjs';

export class SignalStoreObservableBase<TKey extends string | number, TValue> extends SignalStoreBase<TKey, TValue> {

  /** Old / existing functionality with observables */
  #cache$ = toObservable(this.cache);

  // publish only as a read-only signal
  protected get cache$(): Observable<Record<TKey, TValue>> {
    return this.#cache$;
  }
  
  constructor(options: SignalStoreOptions) {
    super(options);
  }

}