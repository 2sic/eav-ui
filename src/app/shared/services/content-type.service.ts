import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ContentType } from '../models/eav/content-type';
import { Observable } from 'rxjs/Observable';
import { Store } from '@ngrx/store';

import { JsonItem1 } from '../models/json-format-v1/json-item1';
import { JsonContentType1 } from '../models/json-format-v1/json-content-type1';
import { AppState } from '../models/app-state';
import * as contentTypeActions from '../../shared/store/actions/content-type.actions';

@Injectable()
export class ContentTypeService {
  public contentTypes$: Observable<ContentType[]>;
  constructor(private httpClient: HttpClient, private store: Store<AppState>) {
  }

  /**
   * Dispatch LoadItemsAction to store
   * @param path
   */
  public loadContentType(path: string) {
    this.store.dispatch(new contentTypeActions.LoadContentTypeAction(path));
  }

  /**
   * Observe content type for item type from store
   * @param id
   */
  public getContentTypeById(id: string): Observable<ContentType> {
    return this.store
      .select(s => s.contentTypes)
      .map(data => data.find(obj => obj.contentType.id === id));
  }

  /**
   * Get Content Type from Json Content Type V1
   */
  public getContentTypeFromJsonContentType1(path: string): Observable<ContentType> {
    // return this.httpClient.get<JsonContentType1>('../../../assets/data/item-edit-form/content-type/json-content-type-v1-person.json')
    // return this.httpClient.get<JsonContentType1>('../../../assets/data/json-content-type-v1.json')
    // return this.httpClient.get<JsonContentType1>('../../../assets/data/item-edit-form/content-type/json-content-type-v1-accordion.json')
    return this.httpClient.get<JsonContentType1>(`../../../assets/data/item-edit-form/content-type/${path}`)
      .map((item: JsonContentType1) => {
        return ContentType.create(item);
      })
      // .do(data => console.log('getEavEntityFromJsonItem1: ', data))
      .catch(this.handleError);
  }

  /**
   * Get Json Content Type V1
   */
  public getJsonContentType1(path: string): Observable<JsonContentType1> {
    return this.httpClient.get<JsonContentType1>(`../../../assets/data/item-edit-form/content-type/${path}`)
      .map((item: JsonContentType1) => {
        return item;
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

