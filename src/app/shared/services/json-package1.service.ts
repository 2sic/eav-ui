import { Injectable } from '@angular/core';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';

import { JsonPackage1 } from '../models/json-format-v1';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/do';
import 'rxjs/add/observable/throw';

@Injectable()
export class JsonPackage1Service {

  constructor(private httpClient: HttpClient) {
  }

  /**
   * Get Json Package V1 from json to class JsonPackage1
   */
  public getJsonPackage1(): Observable<JsonPackage1> {
    return this.httpClient.get<JsonPackage1>('../../../assets/data/json-to-class-test/json-format-v1-test2.json')
      .map((item: JsonPackage1) => {
        return JsonPackage1.create(item);
      })
      // .do(data => console.log('asdasd', data))
      .catch(this.handleError);
  }

  private handleError(error: any) {
    // In a real world app, we might send the error to remote logging infrastructure
    const errMsg = error.message || 'Server error';
    console.error(errMsg);
    return Observable.throw(errMsg);
  }
}
