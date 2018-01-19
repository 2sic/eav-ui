import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ContentType } from '../models/eav/content-type';
import { Observable } from 'rxjs/Observable';
import { JsonItem1 } from '../models/json-format-v1/json-item1';
import { JsonContentType1 } from '../models/json-format-v1/json-content-type1';

@Injectable()
export class ContentTypeService {

  constructor(private httpClient: HttpClient) { }

  /**
   * Get Content Type from Json Content Type V1
   */
  public getContentTypeFromJsonContentType1(): Observable<ContentType> {
    return this.httpClient.get<JsonContentType1>('../../../assets/data/json-content-type-v1.json')
      .map((item: JsonContentType1) => {
        console.log('Ipak pozvano ', item);
        return ContentType.create(item);
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

