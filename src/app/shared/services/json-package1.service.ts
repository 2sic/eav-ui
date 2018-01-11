import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';

import { JsonPackage1 } from '../models/json-format-v1';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';



@Injectable()
export class JsonPackage1Service {

  constructor(private httpClient: HttpClient) {
  }

  /**
   * Get Json Package V1 from json to class JsonPackage1
   */
  public getJsonPackage1(): Observable<JsonPackage1> {
    return this.httpClient.get<JsonPackage1>('../../../assets/data/json-format-v1-test.json')
      .map((item: JsonPackage1) => {
        return JsonPackage1.create(item);
      });
  }

}
