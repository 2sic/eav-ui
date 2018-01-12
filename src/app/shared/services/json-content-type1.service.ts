import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';

import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';

import { JsonContentType1 } from '../models/json-format-v1';

@Injectable()
export class JsonContentType1Service {

  constructor(private httpClient: HttpClient) {
  }

  /**
  * Get Json ContentType V1 from json to class JsonContentType1
  */
  public getJsonContentType1(): Observable<JsonContentType1> {
    return this.httpClient.get<JsonContentType1>('../../../assets/data/json-content-type-v1-test.json')
      .map((item: JsonContentType1) => {
        return JsonContentType1.create(item);
      });
  }
}
