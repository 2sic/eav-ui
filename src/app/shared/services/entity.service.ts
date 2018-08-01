
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Store } from '@ngrx/store';
import { throwError as observableThrowError, Observable, of } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';

import { EavConfiguration } from '../models/eav-configuration';
import { UrlHelper } from '../helpers/url-helper';

@Injectable()
export class EntityService {

  constructor(private httpClient: HttpClient) {
  }

  /**
   * get availableEntities - (used in entity-default input type)
   * @param eavConfig
   * @param body
   * @param ctName
   */
  public getAvailableEntities(eavConfig: EavConfiguration, body: string, ctName: string): Observable<any> {
    const header = UrlHelper.createHeader(eavConfig.tid, eavConfig.mid, eavConfig.cbid);
    // maybe create model for data
    return this.httpClient.post('/desktopmodules/2sxc/api/' + `eav/EntityPicker/getavailableentities`,
      body,
      {
        headers: header,
        params: {
          contentTypeName: ctName,
          appId: eavConfig.appId
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

  // public tryDeleteAndAskForce(eavConfig: EavConfiguration, contentTypeTemp: string, id: string, text: string): boolean {
  //   console.log('tryDeleteAndAskForce');
  //   const notAskForceDelete: Observable<any> = this.delete(eavConfig, contentTypeTemp, id, false);
  //   console.log('notAskForceDelete', notAskForceDelete);
  //   if (notAskForceDelete === empty()) {
  //     console.log('is in');
  //     return this.delete(eavConfig, contentTypeTemp, id, true);
  //   }
  //   console.log('not in');
  //   return notAskForceDelete;
  // }

  public delete(eavConfig: EavConfiguration, type: string, id: string, tryForce: boolean): Observable<any> {
    console.log('GET delete method:');
    // TODO:
    const header = UrlHelper.createHeader(eavConfig.tid, eavConfig.mid, eavConfig.cbid);

    return this.httpClient.get('/desktopmodules/2sxc/api/' + 'eav/entities/delete',
      {
        headers: header,
        // ignoreErrors: 'true',
        params: {
          'contentType': type,
          'id': id,
          'appId': eavConfig.appId,
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
