import { Context as DnnContext } from '@2sic.com/sxc-angular';
import { HttpClient, httpResource } from '@angular/common/http';
import { inject, Injectable, Injector } from '@angular/core';
import { firstValueFrom } from 'rxjs';
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

  /**
   * Makes an HTTP GET request and returns a Promise with just the status code
   * @param endpoint - The API endpoint path(will be combined with base URL)
   * @param options - Angular HttpClient options(headers, params, etc.)
   * @returns Promise that resolves to the HTTP status code(or error status code)
  */
  protected getStatusPromise(
    endpoint: string,
    options?: Parameters<typeof this.http.get>[1]
  ): Promise<number> {
    try {
      // Ensure observe: 'response' is included in the options
      const httpOptions = {
        ...options,
        observe: 'response' as const
      };
      // Convert the Observable returned by HttpClient to a Promise
      return firstValueFrom(
        this.http.get(this.apiUrl(endpoint), httpOptions)
      )
        .then(response => response.status)
        .catch(error => {
          console.error(`HTTP error in getStatusPromise:`, error);
          return error?.status ?? 500;
        });
    } catch (e: any) {
      // This catch handles any synchronous errors
      console.error(`Error in getStatusPromise:`, e);
      return Promise.resolve(500);
    }
  }

  /**
 * Makes an HTTP GET request and returns a Promise with the response body of type T
 * @param endpoint - The API endpoint path (will be combined with base URL)
 * @param options - Angular HttpClient options (headers, params, etc.)
 * @returns Promise that resolves to the HTTP response body of type T (or rejects/returns null on error)
 */
  protected fetchPromise<T>(
    endpoint: string,
    options?: Parameters<typeof this.http.get>[1]
  ): Promise<T> {
    try {
      // Ensure observe: 'body' is used (default for HttpClient.get)
      const httpOptions = {
        ...options,
        observe: 'body' as const
      };
      // Convert the Observable returned by HttpClient to a Promise
      return firstValueFrom(
        this.http.get<T>(this.apiUrl(endpoint), httpOptions)
      ).catch(error => {
        console.error(`HTTP error in fetchPromise:`, error);
        // You can throw, return null, or handle as you wish
        throw error;
      });
    } catch (e: any) {
      // Handles synchronous errors
      console.error(`Error in fetchPromise:`, e);
      return Promise.reject(e);
    }
  }



}
