import { Injectable, signal, Signal, WritableSignal } from '@angular/core';
import { HttpServiceBaseSignal } from './http-service-base-signal';

/**
 * Base class for all services that need to make HTTP calls.
 * Provides important typical information and services, especially
 * * apiUrl(name) - to get the full API URL
 * * appId - the current app id
 * * zoneId - the current zone id
 */
@Injectable()
export class HttpServiceBase extends HttpServiceBaseSignal {

  protected getHttpApiUrl<ResultType>(endpoint: string, options?: Parameters<typeof this.http.get>[1]) {
    const url = this.apiUrl(endpoint);
    return this.http.get<ResultType>(url, options ?? undefined); // has a quick, null would fail, undefined is ok
  }

  protected getHttp<ResultType>(endpoint: string, options?: Parameters<typeof this.http.get>[1]) {
    return this.http.get<ResultType>(endpoint, options);
  }

  protected getAndWrite<ResultType>(endpoint: string, options: Parameters<typeof this.http.get>[1], target: WritableSignal<ResultType>): void {
    this.getHttp<ResultType>(endpoint, options).subscribe(d => {
      target.set(d);
    });
  }

  /**
   * @template ResultType Type of the final resulting data in the signal
   * @template HttpType Type of the data returned by the http call; will match ResultType if no map is provided
   * @param endpoint url / endpoint
   * @param options http options
   * @param initial initial value for the signal, before the http call
   * @param reMap optional mapping function to transform the http result into the signal result
   * @returns 
   */
  protected getSignal<ResultType, HttpType = ResultType>(
    endpoint: string,
    options?: Parameters<typeof this.http.get>[1],
    initial?: ResultType,
    reMap?: (x: HttpType) => ResultType,
  ): Signal<ResultType> {
    // prepare the target signal
    const target = signal<ResultType>(initial);
    // do http call and set the result
    this.getHttpApiUrl<HttpType>(endpoint, options).subscribe(d => {
      // if we have a map function, use it, otherwise just cast
      const transformed = reMap ? reMap(d) : (d as unknown as ResultType);
      target.set(transformed)
    });
    return target;
  }

  protected postSignal<ResultType>(endpoint: string, body: Parameters<typeof this.http.post>[1], options: Parameters<typeof this.http.post>[2], initial: ResultType): Signal<ResultType> {
    const target = signal<ResultType>(initial);
    this.http.post<ResultType>(this.apiUrl(endpoint), body, options).subscribe(d => {
      target.set(d)
    });
    return target;
  }

}
