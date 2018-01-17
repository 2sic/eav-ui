import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';

import { EavItem } from '../models/eav/eav-item';
import { JsonItem1 } from '../models/json-format-v1/json-item1';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';

@Injectable()
export class EavItemService {

  constructor(private httpClient: HttpClient) { }

  /**
   * Get Eav Item from Json Entity V1
   */
  public getEavItemFromJsonItem1(): Observable<EavItem> {
    return this.httpClient.get<JsonItem1>('../../../assets/data/json-entity-v1.json')
      .map((item: JsonItem1) => {
        return EavItem.create(item);
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
