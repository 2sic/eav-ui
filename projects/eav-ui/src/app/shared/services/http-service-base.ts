import { Context as DnnContext } from '@2sic.com/sxc-angular';
import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal, Signal, WritableSignal } from '@angular/core';
import { Context } from '../../shared/services/context';

/**
 * Base class for all services that need to make HTTP calls.
 * Provides important typical information and services, especially
 * * apiUrl(name) - to get the full API URL
 * * appId - the current app id
 * * zoneId - the current zone id
 */
@Injectable()
export class HttpServiceBase {

  protected http = inject(HttpClient);
  protected context = inject(Context);
  #dnnContext = inject(DnnContext);

  constructor() { }

  /**
   * Convert a short 2sxc-url into the correct full URL on the system.
   * @param name 2sxc-style short url
   * @returns
   */
  protected apiUrl(name: string) {
    return this.#dnnContext.$2sxc.http.apiUrl(name);
  }

  /**
   * The current app id
   */
  protected get appId() { return this.context.appId.toString(); }

  /**
   * The current zone id
   */
  protected get zoneId() { return this.context.zoneId.toString(); }

  protected getHttpApiUrl<ResultType>(endpoint: string, options?: Parameters<typeof this.http.get>[1]) {
    const url = this.apiUrl(endpoint);
    return this.http.get<ResultType>(url, options);
  }

  protected getHttp<ResultType>(endpoint: string, options?: Parameters<typeof this.http.get>[1]) {
    return this.http.get<ResultType>(endpoint, options);
  }

  protected getAndWrite<ResultType>(endpoint: string, options: Parameters<typeof this.http.get>[1], target: WritableSignal<ResultType>): void {
    this.getHttp<ResultType>(endpoint, options).subscribe(d => {
      target.set(d);
    });
  }

  protected getSignal<ResultType>(endpoint: string, options?: Parameters<typeof this.http.get>[1], initial?: ResultType): Signal<ResultType> {
    const target = signal<ResultType>(initial);
    this.getHttpApiUrl<ResultType>(endpoint, options).subscribe(d => {
      target.set(d)
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
