import { inject, Injectable } from '@angular/core';
import { Context as DnnContext } from '@2sic.com/sxc-angular';
import { Context } from '../../shared/services/context';
import { HttpClient } from '@angular/common/http';

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
}
