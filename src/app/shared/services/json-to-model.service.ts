import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError } from 'rxjs/operators';
import { Observable } from 'rxjs/Observable';
import { map } from 'rxjs/operator/map';

import { JsonPackage1, JsonItem1, JsonContentType1 } from '../models';

@Injectable()
export class JsonToModelService {
  constructor(private httpClient: HttpClient) {
  }

  public getJsonPackage1(): Observable<any> {
    return this.httpClient.get<any>('../../../assets/data/json-format-v1-test.json');
  }

  public getJsonItem1(): Observable<JsonItem1> {
    return this.httpClient.get<JsonItem1>('../../../assets/data/json-entity-v1-test.json');
  }

  public getJsonContentType1(): Observable<JsonContentType1> {
    return this.httpClient.get<JsonContentType1>('../../../assets/data/json-content-type-v1-test.json');
  }
}

