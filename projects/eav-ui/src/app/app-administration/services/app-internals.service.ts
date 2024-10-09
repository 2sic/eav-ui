import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AppInternals } from '../../app-administration/models/app-internals.model';
import { HttpServiceBase } from '../../shared/services/http-service-base';
import { httpToSignal } from '../../shared/signals/signal.utilities';

const webApiRoot = 'admin/appinternals/get';

@Injectable()
export class AppInternalsService extends HttpServiceBase {

  /**
   * Fetches AppInternals for given key
   * @param targetType type of target metadata item is for, e.g. for Entity, or ContentType
   * @param keyType e.g. for keyType === guid, key === contentTypeStaticName
   * @param key key of target metadata item is for
   * @param contentTypeName name of content type where permissions are stored. If blank, backend returns all metadata except permissions
   */
  getAppInternals(): Observable<AppInternals> {
    return this.http.get<AppInternals>(this.apiUrl(webApiRoot), {
      params: {
        appId: this.appId,
      },
    });
  }

  // New with Signal
  getAppInternalsSig = httpToSignal('getAppInternals',
    this.http.get<AppInternals>(this.apiUrl(webApiRoot), {
      params: {
        appId: this.appId,
      },
    })
  );

  // TODO: Only for Tesing
  // httpToSignalTest<T>(name: string, httpRequest: Observable<T>, initialValue: T = null): Signal<T> {
  //    console.log("call Http");
  //   const sig = signal(initialValue, { equal: isEqual }) as WritableSignal<T>;

  //   // Logging the initial value
  //   // console.log('Initial value before HTTP request:', initialValue);
  //   // HTTP request pipe
  //   httpRequest.subscribe(value => {
  //     sig.set(value);
  //     // Logging after HTTP request completion
  //     // console.log('HTTP request completed, signal set to:', value);
  //   });

  //   return named(name, sig.asReadonly());
  // }


}
