import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { transient } from 'projects/core';
import { EntityLightIdentifier } from 'projects/edit-types/src/EntityLight';
import { catchError, map, Observable, throwError } from 'rxjs';
import { ContentItem } from '../../../content-items/models/content-item.model';
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

  fetchQuery(guid?: string): Observable<ContentItem[] | EntityLightIdentifier[]> {
    const stream = 'Default';
    const params = `configurationguid=${guid}`;
    
    return this.#queryService.getFromQuery(`System.BundleDetails/${stream}`, params, null).pipe(
      map((data) => {
        return data[stream];
      }),
      catchError((error) => {
        console.error(`${this.translate.instant('Fields.Picker.QueryError:')} - ${error.data}`);
        alert(`${this.translate.instant('Fields.Picker.QueryError:')} - ${error.data}`);
        return throwError(() => error);
      })
    );
  }
}
