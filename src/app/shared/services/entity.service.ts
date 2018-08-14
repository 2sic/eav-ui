
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Store } from '@ngrx/store';
import { throwError as observableThrowError, Observable, of } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';

import { UrlConstants } from '../constants/url-constants';

@Injectable()
export class EntityService {

  constructor(private httpClient: HttpClient) {
  }

  /**
   * get availableEntities - (used in entity-default input type)
   * @param apiId
   * @param body
   * @param ctName
   */
  public getAvailableEntities(apiId: string, body: string, ctName: string): Observable<any> {
    // maybe create model for data
    return this.httpClient.post(`${UrlConstants.apiRoot}eav/EntityPicker/getavailableentities`,
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

  public delete(appId: string, type: string, id: string, tryForce: boolean): Observable<any> {
    console.log('GET delete method:');
    return this.httpClient.get(`${UrlConstants.apiRoot}eav/entities/delete`,
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

    // return null;
  }

  private handleError(error: any) {
    // In a real world app, we might send the error to remote logging infrastructure
    const errMsg = error.message || 'Server error';
    console.error(errMsg);
    return observableThrowError(errMsg);
  }
}
