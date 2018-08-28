
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Store } from '@ngrx/store';
import { throwError as observableThrowError, Observable } from 'rxjs';
import { map, catchError, tap, filter } from 'rxjs/operators';

import { Item } from '../models/eav/item';
import { JsonItem1 } from '../models/json-format-v1/json-item1';
import { EavAttributes, EavValue } from '../models/eav';

import * as itemActions from '../store/actions/item.actions';
import * as fromStore from '../store';
import { EavValues } from '../models/eav/eav-values';
import { EavDimensions } from '../models/eav/eav-dimensions';

@Injectable()
export class ItemService {

  // public items$  Observable<Item[]>;

  constructor(private httpClient: HttpClient, private store: Store<fromStore.EavState>) {
    // this.items$ = store.select(fromStore.getItems);
  }

  // public loadAllData(path: string) {
  //   this.store.dispatch(new itemActions.LoadDataAction(path));
  // }

  public loadItem(path: string) {
    this.store.dispatch(new itemActions.LoadItemAction(path));
  }

  public loadItems(items: JsonItem1[]) {
    console.log('start create item');
    items.forEach((jsonItem1: JsonItem1) => {
      const item: Item = Item.create(jsonItem1);
      this.store.dispatch(new itemActions.LoadItemSuccessAction(item));
    });
  }

  public updateItem(attributes: EavAttributes, id: number, headerGuid: string) {
    this.store.dispatch(new itemActions.UpdateItemAction(attributes, id, headerGuid));
  }

  public updateItemAttribute(entityId: number, newEavAttribute: EavValues<any>, attributeKey: string, headerGuid: string) {
    this.store.dispatch(new itemActions.UpdateItemAttributeAction(entityId, newEavAttribute, attributeKey, headerGuid));
  }

  public addItemAttributeValue(entityId: number, newEavAttributeValue: EavValue<any>, attributeKey: string, headerGuid: string) {
    this.store.dispatch(new itemActions.AddItemAttributeValueAction(entityId, newEavAttributeValue, attributeKey, headerGuid));
  }

  public updateItemAttributeValue(entityId: number, attributeKey: string, newEavAttributeValue: string,
    existingDimensionValue: string, defaultLanguage: string, isReadOnly: boolean, headerGuid: string) {
    this.store.dispatch(new itemActions.UpdateItemAttributeValueAction(entityId, attributeKey, newEavAttributeValue,
      existingDimensionValue, defaultLanguage, isReadOnly, headerGuid));
  }

  public updateItemAttributesValues(entityId: number, updateValues: { [key: string]: any },
    languageKey: string, defaultLanguage: string, headerGuid: string) {
    this.store.dispatch(new itemActions.UpdateItemAttributesValuesAction(entityId, updateValues, languageKey, defaultLanguage, headerGuid));
  }

  /**
  * Update entity attribute dimension. Add readonly languageKey to existing useFromLanguageKey.
  * Example to useFrom en-us add fr-fr = "en-us,-fr-fr"
  * */
  public addItemAttributeDimension(entityId: number, attributeKey: string, dimensionValue: string,
    existingDimensionValue: string, defaultLanguage: string, isReadOnly: boolean, headerGuid: string) {
    this.store.dispatch(new itemActions.AddItemAttributeDimensionAction(entityId, attributeKey, dimensionValue,
      existingDimensionValue, defaultLanguage, isReadOnly, headerGuid));
  }

  public removeItemAttributeDimension(entityId: number, attributeKey: string, dimensionValue: string, headerGuid: string) {
    this.store.dispatch(new itemActions.RemoveItemAttributeDimensionAction(entityId, attributeKey, dimensionValue, headerGuid));
  }

  // public updateItem(attributes: EavAttributes, item: EavItem) {
  //   this.store.dispatch(new itemActions.UpdateItemAction(attributes, item));
  // }

  addAttributeValue(
    entityId: number,
    attributeKey: string,
    newValue: any,
    languageKey: string,
    isReadOnly: boolean,
    headerGuid: string) {

    let newLanguageValue = languageKey;

    if (isReadOnly) {
      newLanguageValue = `~${languageKey}`;
    }

    const newEavValue = new EavValue(newValue, [new EavDimensions(newLanguageValue)]);

    this.addItemAttributeValue(entityId, newEavValue, attributeKey, headerGuid);
  }

  public deleteItem(item: Item) {
    this.store.dispatch(new itemActions.DeleteItemAction(item));
  }

  // public selectAttributeByEntityId(entityId: number, attributeKey: string, headerGuid: string): Observable<EavValues<any>> {
  //   return this.store
  //     .select(fromStore.getItems)
  //     .pipe(map(c => c.find(obj => obj.entity.id === 0 ? obj.header.guid === headerGuid : obj.entity.id === entityId)
  //       ? c.find(obj => obj.entity.id === entityId).entity.attributes[attributeKey]
  //       : null));
  // }

  public selectAttributesByEntityId(entityId: number, headerGuid: string): Observable<EavAttributes> {
    return this.store
      .select(fromStore.getItems)
      .pipe(map(c => c.find(obj => obj.entity.id === 0 ? obj.header.guid === headerGuid : obj.entity.id === entityId)
        ? c.find(obj => obj.entity.id === 0 ? obj.header.guid === headerGuid : obj.entity.id === entityId).entity.attributes
        : null));
  }

  public selectAllItems(): Observable<Item[]> {
    return this.store.select(fromStore.getItems);
  }

  // public selectItemById(id: number): Observable<Item> {
  //   return this.store
  //     .select(fromStore.getItems)
  //     .pipe(map(data => data.find(obj => obj.entity.id === id)));
  // }

  /**
   * Select items from store by id array list
   * @param idsList
   */
  public selectItemsByIdList(idsList: any[]): Observable<Item[]> {
    return this.store
      .select(fromStore.getItems)
      .pipe(map(data => {
        console.log('[Empty Entity] data:', data);
        return data.filter(obj => obj.entity === null || idsList.filter(id => id === obj.entity.id || id === obj.header.guid).length > 0);
      }));
  }

  // public selectItemById(id: number): Observable<Item> {
  //   return this.store.select(fromStore.getItemById(id));
  // }

  /**
   * Get Item from Json Entity V1
   */
  public getItemFromJsonItem1(path: string): Observable<Item> {
    // return this.httpClient.get<JsonItem1>('../../../assets/data/item-edit-form/item/json-item-v1-person.json')
    // return this.httpClient.get<JsonItem1>(`../../../assets/data/item-edit-form/item/json-item-v1-accordion.json`)
    return this.httpClient.get<JsonItem1>(`/DesktopModules/ToSIC_SexyContent/dist/ng-edit/assets/data/item-edit-form/item/${path}`)
      .pipe(
        map((item: JsonItem1) => {
          return Item.create(item);
        }),
        // tap(data => console.log('getItemFromJsonItem1: ', data)),
        catchError(error => this.handleError(error))
      );
  }

  /**
   * Get Json Entity V1
   */
  public getJsonItem1(path: string): Observable<JsonItem1> {
    return this.httpClient.get<JsonItem1>(`../../../assets/data/json-to-class-test/item/${path}`)
      .pipe(
        map((item: JsonItem1) => {
          return item;
        }),
        // tap(data => console.log('getItemFromJsonItem1: ', data)),
        catchError(error => this.handleError(error))
      );
  }

  private handleError(error: any) {
    // In a real world app, we might send the error to remote logging infrastructure
    const errMsg = error.message || 'Server error';
    console.error(errMsg);
    return observableThrowError(errMsg);
  }
}
