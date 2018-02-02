import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import { Store } from '@ngrx/store';

import { Item } from '../models/eav/item';
import { JsonItem1 } from '../models/json-format-v1/json-item1';
import { AppState } from '../models/app-state';
import * as itemActions from '../../shared/store/actions/item.actions';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';

@Injectable()
export class ItemService {

  public items$: Observable<Item[]>;

  constructor(private httpClient: HttpClient, private store: Store<AppState>) {
    this.items$ = store.select('items');
  }

  public loadItem(path: string) {
    this.store.dispatch(new itemActions.LoadItemsAction(path));
  }

  public updateItem(item: Item) {
    this.store.dispatch(new itemActions.UpdateItem(item));
  }

  public selectItemById(id: number): Observable<Item> {
    return this.store
      .select(s => s.items)
      .map(data => data.find(obj => obj.entity.id === id));
  }

  /**
   * Get  Item from Json Entity V1
   */
  public getItemFromJsonItem1(path: string): Observable<Item> {
    // return this.httpClient.get<JsonItem1>('../../../assets/data/item-edit-form/item/json-item-v1-person.json')
    // return this.httpClient.get<JsonItem1>(`../../../assets/data/item-edit-form/item/json-item-v1-accordion.json`)
    return this.httpClient.get<JsonItem1>(`../../../assets/data/item-edit-form/item/${path}`)
      .map((item: JsonItem1) => {
        return Item.create(item);
      })
      // .do(data => console.log('getItemFromJsonItem1: ', data))
      .catch(this.handleError);
  }

  private handleError(error: any) {
    // In a real world app, we might send the error to remote logging infrastructure
    const errMsg = error.message || 'Server error';
    console.error(errMsg);
    return Observable.throw(errMsg);
  }
}
