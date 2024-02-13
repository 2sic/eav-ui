import { Observable, tap } from 'rxjs';
import { EavLogger } from './eav-logger';

export enum RxJsLoggingLevel {
  TRACE,
  DEBUG,
  INFO,
  ERROR,
}

let rxjsLoggingLevel = RxJsLoggingLevel.INFO;

export function setRxJsLoggingLevel(level: RxJsLoggingLevel) {
  rxjsLoggingLevel = level;
}

// Inspired by https://blog.angular-university.io/debug-rxjs/
// export const rxDebug =
//   (level: number, message: string) => (source: Observable<any>) =>
//     source.pipe(
//       tap((val) => {
//         if (level >= rxjsLoggingLevel) {
//           console.log(message + ': ', val);
//         }
//       })
//     );

const eavRxJsDebug =
  <T>(logger: EavLogger, message: string) =>
  (source: Observable<T>) =>
    source.pipe(
      tap((data) => {
        logger.add(message, data);
      })
    );

/**
 * Special debug helper for RxJS observables
 */    
export class RxTapDebug {
  /**
   * 
   * @param logger the main objects logger with name etc.
   * @param name name of the stream we're logging
   * @param jsonify will JSON.stringify the data if true - this is much faster as the browser doesn't block the debugger as much 
   */
  constructor(private logger: EavLogger, private name: string, private jsonify: boolean = true) {}

  private eavRxJsDebug<T>(key: string, message?: string) {
    const label = `${this.name}/${key}`;
    const counter = {
      count: 0,
    }
    // return a function that takes an observable and returns an observable
    // and logs the data, and counts every access
    return (source: Observable<T>) =>
      source.pipe(
        tap((data) => this.logger.add(label + ` #${counter.count++}`, this.jsonify ? JSON.parse(JSON.stringify(data)) : data))
      );
  };

  start<T>() { return  this.eavRxJsDebug<T>('start'); }

  pipe<T>() { return  this.eavRxJsDebug<T>('pipe'); }

  map<T>(name: string) { return  this.eavRxJsDebug<T>(name ? `map-${name}` : 'map'); }

  end<T>() { return  this.eavRxJsDebug<T>('end'); }

  step: <T>(num: number) => (source: Observable<T>) => Observable<T> = (
    num: number
  ) => this.eavRxJsDebug('step' + num);

  part<T>(part: string) { return this.eavRxJsDebug<T>(part); };

  read<T>() { return this.eavRxJsDebug<T>('read'); }

  shareReplay<T>() { return this.eavRxJsDebug<T>('shareReplay'); }

  distinctUntilChanged<T>() {return this.eavRxJsDebug<T>('distinctUntilChanged'); }
}
