

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { throwError as observableThrowError, Observable } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';

import { UrlHelper } from '../helpers/url-helper';
import { EavConfiguration } from '../models/eav-configuration';

@Injectable()
export class DnnBridgeService {
  constructor(private httpClient: HttpClient) { }

  public getUrlOfId(eavConfig: EavConfiguration, idCode: string, contentType: string, guid: string, field: string): Observable<any> {
    console.log('GET getUrlOfId:');
    const linkLowered = idCode.toLowerCase();

    if (linkLowered.indexOf('file:') !== -1 || linkLowered.indexOf('page:') !== -1) {
      // TODO:
      const header = UrlHelper.createHeader(eavConfig.tid, eavConfig.mid, eavConfig.cbid);
      // /desktopmodules/2sxc/api/eav/system/features
      return this.httpClient.get('/desktopmodules/2sxc/api/' + 'dnn/Hyperlink/ResolveHyperlink?hyperlink='
        + encodeURIComponent(idCode)
        + (guid ? '&guid=' + guid : '')
        + (contentType ? '&contentType=' + contentType : '')
        + (field ? '&field=' + field : '')
        + '&appId=' + eavConfig.appId,
        {
          headers: header,
        })
        .pipe(
          map((data: any) => {
            return data;
          }),
          tap(data => console.log('features: ', data)),
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
