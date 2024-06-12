import { Observable, pipe, UnaryFunction } from 'rxjs';
import { distinctUntilChanged, map } from 'rxjs/operators';

// inspired by https://github.com/christianlundberg/rxjs-augmented/commit/85861cf3574d63eeecea082f0916e8c7e32e7d5a#diff-3917cfeb8eeb05872c1d6da16fb9e1da5bbfce331e7d985422f20b0775186c48
// but modified to do map first

/**
 * Combine map and distinctUntilChanged, as this is a very common pattern.
 * @param fn the mapping function
 * @returns 
 */
export function mapUntilChanged<T, R>(
    fn: (state: T) => R
): UnaryFunction<Observable<T>, Observable<R>> {
    return pipe(
        map(fn),
        distinctUntilChanged(),
    );
}