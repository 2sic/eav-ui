
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { throwError, Observable, of } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';

import { UrlConstants } from '../constants/url-constants';

@Injectable()
export class QueryService {

  constructor(private httpClient: HttpClient) {
  }

  /**
   * get availableEntities - (used in entity-query and string-dropdown-query input type)
   * @param apiId
   * @param body
   * @param ctName
   */
  public getAvailableEntities(queryUrl: string, includeGuid: boolean, params: string, ignoreErrors: boolean): Observable<any> {
    return this.httpClient.get(`${UrlConstants.apiRoot}app/auto/query/${queryUrl}?includeGuid=${includeGuid}${params ? '&' + params : ''}`)
      .pipe(
        map((data: any) => {
          return data;
        }),
        // tap(data => console.log('items subfolder: ', subfolder)),
        catchError(error => this.handleError(error))
      );
  }

  private handleError(error: any) {
    // In a real world app, we might send the error to remote logging infrastructure
    const errMsg = error.message || 'Server error';
    console.error(errMsg);
    return throwError(errMsg);
  }
}
