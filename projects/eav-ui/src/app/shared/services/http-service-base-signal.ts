import { Context as DnnContext } from '@2sic.com/sxc-angular';
import { HttpClient, httpResource } from '@angular/common/http';
import { inject, Injectable, Injector } from '@angular/core';
import { Context } from '../../shared/services/context';

/**
 * Base class for all services that need to make HTTP calls.
 * Provides important typical information and services, especially
 * * apiUrl(name) - to get the full API URL
 * * appId - the current app id
 * * zoneId - the current zone id
 */
@Injectable()
export class HttpServiceBaseSignal {

  protected http = inject(HttpClient);
  protected context = inject(Context);

  // Retrieves the current Angular Injector instance from the DI system and stores it as a protected property.
  // This allows you to create instances (e.g., services) later in this specific context.
  protected injector = inject(Injector);

  #dnnContext = inject(DnnContext);

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

  /**
 * NEW V20 Helper method to create an httpResource<T> with additional options such as a custom injector.
 * Advantage: If the httpResource API changes in the future, you only need to update this method in one place.
 * @param request - The request callback or object for httpResource<T>. 
 *                  The signature is identical to the first parameter of httpResource<T>.
 * @returns A new httpResource<T> signal with centrally configurable options.
 */
  protected newHttpResource<T>(request: Parameters<typeof httpResource>[0]) {
    return httpResource<T>(request, { injector: this.injector });
  }

}
