import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';

import { JsonItem1 } from '../models/json-format-v1';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';

@Injectable()
export class JsonItem1Service {

  constructor(private httpClient: HttpClient) { }

  /**
   * Get Json Entity V1 from json to class JsonItem1
   */
  public getJsonItem1(): Observable<JsonItem1> {
    return this.httpClient.get<JsonItem1>('../../../assets/data/json-entity-v1.json')
      .map((item: JsonItem1) => {
        return JsonItem1.create(item);
      });
  }

  // Example of converting one observabe Type to another observable type
  /* getJsonItem(): Observable<JsonContentType1> {
    console.log(`getJsonItem`);
    return this.httpClient.get<JsonItem1>('../../../assets/data/json-entity-v1-test.json').
      map((item: JsonItem1) => {
        const ante: JsonContentType1 = new JsonContentType1(new JsonHeader1(1), new ContentType1('ante', 'mate', 'scope', 'haha', []));

        console.log(`ante: `, ante);
        return ante;
      });
  } */

}
