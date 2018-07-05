import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { UrlHelper } from '../helpers/url-helper';
import { EavConfiguration } from '../models/eav-configuration';
import { Observable } from 'rxjs/Observable';

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
        .map((data: any) => {
          return data;
        })
        .do(data => console.log('features: ', data))
        .catch(this.handleError);
    } else {
      return null;
    }
  }

  private handleError(error: any) {
    // In a real world app, we might send the error to remote logging infrastructure
    const errMsg = error.message || 'Server error';
    console.error(errMsg);
    return Observable.throw(errMsg);
  }
}
