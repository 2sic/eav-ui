import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { transient } from 'projects/core';
import { Observable } from 'rxjs';
import { QueryService } from '../../../shared/services/query.service';




/**
 * Helper to handle dialog routings, especially:
 * 1. handling on-child-closed events (it also takes care of subscriptions)
 * 2. accessing the router and route - a very common task when you have dialogs
 */
@Injectable()
export class DataBundlesService {

  #queryService = transient(QueryService);

  constructor(
    private translate: TranslateService,
  ) { }

  fetchQuery(guid?: string): Observable<any> {
    const stream = 'Default';
    const params = `configurationguid=${guid}`;

    return new Observable(observer => {
      this.#queryService.getFromQuery(`System.BundleDetails/${stream}`, params, null).subscribe({
        next: (data) => {
          if (!data) {
            console.error(this.translate.instant('Fields.Picker.QueryErrorNoData'));
            observer.error('No data found');
            return;
          }
          if (!data[stream]) {
            console.error(this.translate.instant('Fields.Picker.QueryStreamNotFound') + ' ' + stream);
            observer.error('Stream not found');
            return;
          }
          observer.next(data[stream]);
          observer.complete();
        },
        error: (error) => {
          console.error(`${this.translate.instant('Fields.Picker.QueryError')} - ${error.data}`);
          observer.error(error);
        }
      });
    });
  }

}
