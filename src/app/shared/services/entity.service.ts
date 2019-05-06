
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { TranslateService } from '@ngx-translate/core';
import { throwError, Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

import { UrlConstants } from '../constants/url-constants';
import { EavConfiguration } from '../models/eav-configuration';
import { EavService } from './eav.service';

@Injectable()
export class EntityService {
  private eavConfig: EavConfiguration;

  constructor(
    private httpClient: HttpClient,
    private translate: TranslateService,
    private eavService: EavService,
  ) {
    this.eavConfig = this.eavService.getEavConfiguration();
  }

  /**
   * get availableEntities - (used in entity-default input type)
   * @param apiId
   * @param body
   * @param ctName
   */
  public getAvailableEntities(apiId: string, body: string, ctName: string): Observable<any> {
    // maybe create model for data
    return this.httpClient.post(`${this.eavConfig.portalroot + UrlConstants.apiRoot}eav/EntityPicker/getavailableentities`,
      body,
      {
        params: {
          contentTypeName: ctName,
          appId: apiId
        }
      }
    ).pipe(
      map((data: any) => {
        return data;
      }),
      // tap(data => console.log('getAvailableEntities: ', data)),
      catchError(error => this.handleError(error))
    );
  }

  public delete(appId: string, type: string, id: string, itemTitle: string, tryForce: boolean): Observable<any> {
    const msg = this.translate.instant('General.Questions.DeleteEntity', { title: itemTitle, id: id });
    if (!confirm(msg)) {
      return null;
    } else {
      console.log('GET delete method:');
      return this.httpClient.get(`${this.eavConfig.portalroot + UrlConstants.apiRoot}eav/entities/delete`,
        {
          // ignoreErrors: 'true',
          params: {
            'contentType': type,
            'id': id,
            'appId': appId,
            'force': tryForce.toString()
          }
        })
        .pipe(
          map((data: any) => {
            console.log('data retun', data);
            return data;
          }),
          // tap(data => console.log('entity delete: ', data)),
          catchError(error => of(error))
        );
    }

    // return null;
  }

  private handleError(error: any) {
    // In a real world app, we might send the error to remote logging infrastructure
    const errMsg = error.message || 'Server error';
    console.error(errMsg);
    return throwError(errMsg);
  }
}
