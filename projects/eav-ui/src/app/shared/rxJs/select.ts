// import { Observable, pipe, UnaryFunction } from 'rxjs';
// import { distinctUntilChanged, map } from 'rxjs/operators';

// // inspired by https://github.com/christianlundberg/rxjs-augmented/blob/master/src/operators/select.ts

// // I guess the name isn't very clear, so comment out for now

// /**
//  * Will only emit when the value returned by the selector function changes.
//  * @param fn 
//  * @returns 
//  */
// export function select<T, R>(
//     fn: (state: T) => R
// ): UnaryFunction<Observable<T>, Observable<R>> {
//     return pipe(
//         distinctUntilChanged(),
//         map(fn),
//         distinctUntilChanged()
//     );
// }