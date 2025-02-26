import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { transient } from 'projects/core';
import { catchError, map, Observable, throwError } from 'rxjs';
import { QueryService } from '../../../shared/services/query.service';

/**
 * Helper to handle dialog routings, especially:
 * 1. handling on-child-closed events (it also takes care of subscriptions)
 * 2. accessing the router and route - a very common task when you have dialogs
 */
@Injectable()
export class DataBundlesQueryService {

  #queryService = transient(QueryService);

  constructor(private translate: TranslateService) { }

  // TODO: @2pp
  // 1. make this typed - create a type etc.

  fetchQuery(guid?: string): Observable<any> {
    const stream = 'Default';
    const params = `configurationguid=${guid}`;

    return this.#queryService.getFromQuery(`System.BundleDetails/${stream}`, params, null).pipe(
      map((data) => {

        // Error handling
        if (!data || !data[stream] || data[stream].length === 0)
          throw new Error(`No data found by Params: ${params} | Stream: ${stream}`);

        console.log(data[stream]);
        return data[stream];
      }),
      catchError((error) => {
        console.error(`${this.translate.instant('Fields.Picker.QueryError:')} - ${error.data}`);
        return throwError(() => error);
      })
    );
  }

}
