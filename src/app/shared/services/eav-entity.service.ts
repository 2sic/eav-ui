import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';

import { JsonItem1 } from '../models/json-format-v1';
import { EavEntity } from '../models/eav';

import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/do';
import 'rxjs/add/observable/throw';

@Injectable()
export class EavEntityService {

  constructor(private httpClient: HttpClient) { }

  /**
   * Get Eav Entity from Json Entity V1
   */
  public getEavEntityFromJsonItem1(): Observable<EavEntity> {
    return this.httpClient.get<JsonItem1>('../../../assets/data/json-entity-v1.json')
      .map((item: JsonItem1) => {
        return EavEntity.create(item.Entity);
      })
      // .do(data => console.log('getEavEntityFromJsonItem1: ', data))
      .catch(this.handleError);
  }

  private handleError(error: any) {
    // In a real world app, we might send the error to remote logging infrastructure
    const errMsg = error.message || 'Server error';
    console.error(errMsg);
    return Observable.throw(errMsg);
  }
}
