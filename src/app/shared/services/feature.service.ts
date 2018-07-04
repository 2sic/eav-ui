import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';

import { UrlHelper } from '../helpers/url-helper';
import { EavConfiguration } from '../models/eav-configuration';
import { of } from 'rxjs/observable/of';

@Injectable()
export class FeatureService {

    constructor(private httpClient: HttpClient) {
    }

    public getFeatures(eavConfig: EavConfiguration, url: string): Observable<any> {
        console.log('GET getFeatures:');
        // TODO:
        const header = UrlHelper.createHeader(eavConfig.tid, eavConfig.mid, eavConfig.cbid);

        return this.httpClient.get('/desktopmodules/2sxc/api/eav/system/features',
            {
                headers: header,
                params: {
                    appId: eavConfig.appId
                }
            })
            .map((data: any) => {
                return data;
            })
            .do(data => console.log('features: ', data))
            .catch(this.handleError);
    }

    enabled = (guid: string, eavConfig: EavConfiguration, url: string): Observable<boolean> => {
        return this.getFeatures(eavConfig, url)
            .switchMap(s => this.enabledNow(s, guid));
    }

    private enabledNow = (list, guid): Observable<boolean> => {
        for (let i = 0; i < list.length; i++) {
            if (list[i].id === guid) {
                return of(list[i].enabled);
            }
        }
        return of(false);
    }

    private handleError(error: any) {
        // In a real world app, we might send the error to remote logging infrastructure
        const errMsg = error.message || 'Server error';
        console.error(errMsg);
        return Observable.throw(errMsg);
    }
}
