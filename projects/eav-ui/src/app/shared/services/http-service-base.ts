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

  // TODO: @2dg
  protected getHttp<ResultType>(endpoint: string, options: Parameters<typeof this.http.get>[1]) {
    return this.http.get<ResultType>(endpoint, options);
  }

  // TODO: @2dg
  protected getAndWrite<ResultType>(endpoint: string, options: Parameters<typeof this.http.get>[1], target: WritableSignal<ResultType>): void {
    this.getHttp<ResultType>(endpoint, options).subscribe(d => target.set(d));
  }

  // TODO: @2dg
  protected getSignal<ResultType>(endpoint: string, options: Parameters<typeof this.http.get>[1], initial: ResultType): Signal<ResultType> {
    const target = signal<ResultType>(initial);
    this.getHttp<ResultType>(endpoint, options).subscribe(d => target.set(d));
    return target;
  }

  // TODO: @2dg
  // protected getSignal2<ResultType>(endpoint: string, options: Parameters<typeof this.http.get>[1], initial: ResultType | Signal<ResultType>): Signal<ResultType> {
  //   const target = initial instanceof Signal ? initial : signal<ResultType>(initial);
  //   this.get<ResultType>(endpoint, options).subscribe(d => target.set(d));
  //   return target;
  // }
}
