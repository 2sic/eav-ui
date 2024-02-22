import { Observable, tap } from 'rxjs';
import { EavLogger } from './eav-logger';

/**
 * Special debug helper for RxJS observables
 */
export class RxTapDebug {
  /**
   * Constructor which will know the context and name of the stream it's for
   * @param logger the main objects logger with name etc.
   * @param name name of the stream we're logging
   * @param jsonify will JSON.stringify the data if true - this is much faster as the browser doesn't block the debugger as much
   */
  constructor(private logger: EavLogger, public name: string, private enabled = true, private jsonify: boolean = true) {}

  /**
   * Generate a rxjs tap function that logs the data with the current context
   * Inspired by https://blog.angular-university.io/debug-rxjs/
   * @param key
   * @param subName
   * @param message
   * @returns
   */
  private generateFn<T>(key: string, subName?: unknown, message?: string): (source: Observable<T>) => Observable<T> {
    // if not enabled, just return the original observable
    if (!this.enabled || !this.logger.enabled) return (source: Observable<T>) => source;

    const label = `${this.name}/${key}${subName ? `-${subName}` : ''}`;
    let counter = 0;

    // return a function that takes an observable and returns an observable
    // and logs the data, and counts every access
    return (source: Observable<T>) =>
      source.pipe(
        tap((data) => {
          const showData = data == null
            ? data  // if null or undefined, just show it
            : this.jsonify ? JSON.parse(JSON.stringify(data)) : data;
          return this.logger.add(label + ` #${counter++}`, showData);
        })
      );
  };


  /**
   * Recommended to use at the beginning of a pipe to show when inbound signals came
   * @param subName optional sub-name, to distinguish between different uses
   */
  pipe<T>(subName?: string) { return this.generateFn<T>('pipe', subName); }

  /**
   * Recommended after map to show what the map did
   * @param subName optional sub-name, to distinguish between different uses
   */
  map<T>(subName?: string) { return this.generateFn<T>('map', subName); }

  /**
   * Recommended after filter to show what the filter did
   * @param subName optional sub-name, to distinguish between different uses
   */
  filter<T>(subName?: string) { return this.generateFn<T>('filter', subName); }

  /**
   * Recommended after shareReplay
   * @param subName optional sub-name, to distinguish between different uses
   * @returns
   */
  shareReplay<T>(subName?: string) { return this.generateFn<T>('shareReplay', subName); }

  /**
   * Recommended after distinctUntilChanged
   * @param subName optional sub-name, to distinguish between different uses
   * @returns
   */
  distinctUntilChanged<T>(subName?: string) {return this.generateFn<T>('distinctUntilChanged', subName); }


  start<T>() { return this.generateFn<T>('start'); }
  end<T>() { return this.generateFn<T>('end'); }
  step<T>(num: number) { return this.generateFn('step' + num); }
  part<T>(subName?: string) { return this.generateFn<T>('part', subName); };
  read<T>(subName?: string) { return this.generateFn<T>('read', subName); }
}
