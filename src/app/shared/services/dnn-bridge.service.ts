

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { throwError as observableThrowError, Observable } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';

import { UrlHelper } from '../helpers/url-helper';
import { UrlConstants } from '../constants/url-constants';

@Injectable()
export class DnnBridgeService {
  constructor(private httpClient: HttpClient) { }

  public getUrlOfId(appId: string, idCode: string, contentType: string, guid: string, field: string): Observable<any> {
    const linkLowered = idCode.toLowerCase();

    if (linkLowered.indexOf('file:') !== -1 || linkLowered.indexOf('page:') !== -1) {
      return this.httpClient.get(UrlConstants.apiRoot + 'dnn/Hyperlink/ResolveHyperlink?hyperlink='
        + encodeURIComponent(idCode)
        + (guid ? '&guid=' + guid : '')
        + (contentType ? '&contentType=' + contentType : '')
        + (field ? '&field=' + field : '')
        + '&appId=' + appId)
        .pipe(
          map((data: any) => {
            return data;
          }),
          // tap(data => console.log('Hyperlink data: ', data)),
          catchError(error => this.handleError(error))
        );
      // .do(data => console.log('features: ', data))
      // .catch(this.handleError);
    } else {
      return null;
    }
  }

  private handleError(error: any) {
    // In a real world app, we might send the error to remote logging infrastructure
    const errMsg = error.message || 'Server error';
    console.error(errMsg);
    return observableThrowError(errMsg);
  }
}
