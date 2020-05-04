import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { throwError, Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Context as DnnContext } from '@2sic.com/dnn-sxc-angular';

@Injectable()
export class QueryService {
  constructor(private httpClient: HttpClient, private dnnContext: DnnContext) { }

  /** (used in entity-query and string-dropdown-query input type) */
  getAvailableEntities(queryUrl: string, includeGuid: boolean, params: string, ignoreErrors: boolean) {
    return this.httpClient
      .get(this.dnnContext.$2sxc.http.apiUrl(`app/auto/query/${queryUrl}?includeGuid=${includeGuid}${params ? '&' + params : ''}`))
      .pipe(catchError(error => this.handleError(error))) as Observable<any>;
  }

  private handleError(error: Error) {
    const errMsg = error.message || 'Server error';
    console.error(errMsg);
    return throwError(errMsg);
  }
}
