import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import { Store } from '@ngrx/store';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';

import { Item } from '../models/eav/item';
import { JsonItem1 } from '../models/json-format-v1/json-item1';
import { AppState } from '../models/app-state';
import { EavAttributes, EavValue } from '../models/eav';
// import { ItemState } from '../store/reducers/item.reducer';

import * as itemActions from '../../shared/store/actions/item.actions';
import * as dataActions from '../../shared/store/actions/data.actions';
import * as contentTypeActions from '../../shared/store/actions/content-type.actions';
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

  public updateItem(attributes: EavAttributes, id: number) {
    this.store.dispatch(new itemActions.UpdateItemAction(attributes, id));
  }

  public updateItemAttribute(entityId: number, newEavAttribute: EavValues<any>, attributeKey: string) {
    this.store.dispatch(new itemActions.UpdateItemAttributeAction(entityId, newEavAttribute, attributeKey));
  }

  public addItemAttributeValue(entityId: number, newEavAttributeValue: EavValue<any>, attributeKey: string) {
    this.store.dispatch(new itemActions.AddItemAttributeValueAction(entityId, newEavAttributeValue, attributeKey));
  }

  public updateItemAttributeValue(entityId: number, attributeKey: string, newEavAttributeValue: string,
    existingDimensionValue: string, isReadOnly: boolean) {
    this.store.dispatch(new itemActions.UpdateItemAttributeValueAction(entityId, attributeKey, newEavAttributeValue,
      existingDimensionValue, isReadOnly));
  }

  public updateItemAttributesValues(entityId: number, updateValues: { [key: string]: any }, languageKey: string) {
    this.store.dispatch(new itemActions.UpdateItemAttributesValuesAction(entityId, updateValues, languageKey));
  }
  /**
  * Update entity attribute dimension. Add readonly languageKey to existing useFromLanguageKey.
  * Example to useFrom en-us add fr-fr = "en-us,-fr-fr"
  * */
  public addItemAttributeDimension(entityId: number, attributeKey: string, dimensionValue: string,
    existingDimensionValue: string, isReadOnly: boolean) {
    this.store.dispatch(new itemActions.AddItemAttributeDimensionAction(entityId, attributeKey, dimensionValue,
      existingDimensionValue, isReadOnly));
  }

  public removeItemAttributeDimension(entityId: number, attributeKey: string, dimensionValue: string) {
    this.store.dispatch(new itemActions.RemoveItemAttributeDimensionAction(entityId, attributeKey, dimensionValue));
  }

  // public updateItem(attributes: EavAttributes, item: EavItem) {
  //   this.store.dispatch(new itemActions.UpdateItemAction(attributes, item));
  // }

  addAttributeValue(
    entityId: number,
    attributeKey: string,
    oldAttributeValues: EavValues<any>,
    newValue: any,
    languageKey: string,
    isReadOnly: boolean) {

    let newLanguageValue = languageKey;

    if (isReadOnly) {
      newLanguageValue = `~${languageKey}`;
    }

    const newEavValue = new EavValue(newValue, [new EavDimensions(newLanguageValue)]);

    this.addItemAttributeValue(entityId, newEavValue, attributeKey);
  }

  public deleteItem(item: Item) {
    this.store.dispatch(new itemActions.DeleteItemAction(item));
  }

  public selectItemById(id: number): Observable<Item> {
    return this.store
      .select(fromStore.getItems)
      .map(data => data.find(obj => obj.entity.id === id));
  }

  public selectAttributeByEntityId(entityId: number, attributeKey: string): Observable<EavValues<any>> {
    return this.store
      .select(fromStore.getItems)
      .map(c => c.find(obj => obj.entity.id === entityId)
        ? c.find(obj => obj.entity.id === entityId).entity.attributes[attributeKey]
        : null);
  }

  public selectAttributesByEntityId(entityId: number): Observable<EavAttributes> {
    return this.store
      .select(fromStore.getItems)
      .map(c => c.find(obj => obj.entity.id === entityId)
        ? c.find(obj => obj.entity.id === entityId).entity.attributes
        : null);
  }

  public selectAllItems(): Observable<Item[]> {
    return this.store.select(fromStore.getItems);
  }


  /**
   * Get Item from Json Entity V1
   */
  public getItemFromJsonItem1(path: string): Observable<Item> {
    // return this.httpClient.get<JsonItem1>('../../../assets/data/item-edit-form/item/json-item-v1-person.json')
    // return this.httpClient.get<JsonItem1>(`../../../assets/data/item-edit-form/item/json-item-v1-accordion.json`)
    return this.httpClient.get<JsonItem1>(`/DesktopModules/ToSIC_SexyContent/dist/ng-edit/assets/data/item-edit-form/item/${path}`)
      .map((item: JsonItem1) => {
        console.log('kreiran item:', Item.create(item));
        return Item.create(item);
      })
      // .do(data => console.log('getItemFromJsonItem1: ', data))
      .catch(this.handleError);
  }

  /**
   * Get Json Entity V1
   */
  public getJsonItem1(path: string): Observable<JsonItem1> {
    return this.httpClient.get<JsonItem1>(`/DesktopModules/ToSIC_SexyContent/dist/ng-edit/assets/data/item-edit-form/item/${path}`)
      .map((item: JsonItem1) => {
        return item;
      })
      // .do(data => console.log('getItemFromJsonItem1: ', data))
      .catch(this.handleError);
  }

  public getAllData() {
    this.store.dispatch(new dataActions.LoadAllDataAction());
  }

  /**
     * Get Item from Json Entity V1
     */
  public getAllDataForForm(): Observable<any> {
    // return this.httpClient.get<JsonItem1>('../../../assets/data/item-edit-form/item/json-item-v1-person.json')
    // return this.httpClient.get<JsonItem1>(`../../../assets/data/item-edit-form/item/json-item-v1-accordion.json`)

    console.log('call getAllDataForForm');

    const body = JSON.stringify([{ 'EntityId': 1729 }]);
    const header = new HttpHeaders({
      'TabId': '55',
      'ContentBlockId': '419',
      'ModuleId': '419',
      'Content-Type': 'application/json;charset=UTF-8',
      'RequestVerificationToken': 'abcdefgihjklmnop'
    });
    // header.append('TabId', '55');
    // header.append('ContentBlockId', '419');
    // header.append('ModuleId', '419');
    // header.append('Content-Type', 'application/json;charset=UTF-8');
    // header.append('RequestVerificationToken', 'abcdefgihjklmnop');
    // Content-Length: 19
    // tslint:disable-next-line:max-line-length
    console.log('HttpHeaders', header);

    return this.httpClient.post(`http://2sxc-dnn742.dnndev.me/desktopmodules/2sxc/api/eav/ui/load?appId=15`, body, { headers: header })
      .map((data: any) => {
        console.log('response getAllDataForForm:', data);
        this.store.dispatch(new itemActions.LoadItemSuccessAction(data.ContentTypes));
        this.store.dispatch(new contentTypeActions.LoadContentTypeSuccessAction(data.contentType));

        return data;
      })
      .do(data => console.log('getAllDataForForm: ', data))
      .catch(this.handleError);
  }

  private handleError(error: any) {
    // In a real world app, we might send the error to remote logging infrastructure
    const errMsg = error.message || 'Server error';
    console.error(errMsg);
    return Observable.throw(errMsg);
  }
}
