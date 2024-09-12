import { Observable, pipe, UnaryFunction } from 'rxjs';
import { distinctUntilChanged, map } from 'rxjs/operators';
import isEqual from 'lodash-es/isEqual';

/**
 * Combine map and distinctUntilChanged, as this is a very common pattern.
 * @param fn the mapping function
 * @returns
 */
export function mapUntilChanged<T, R>(
  fn: (state: T) => R
): UnaryFunction<Observable<T>, Observable<R>> {
  return pipe(
    distinctUntilChanged(),
    map(fn),
    distinctUntilChanged(),
  );
}

export function mapUntilObjChanged<T, R>(
  fn: (state: T) => R
): UnaryFunction<Observable<T>, Observable<R>> {
  return pipe(
    distinctUntilChanged(isEqual),
    map(fn),
    distinctUntilChanged(isEqual),
  );
}
