
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Store } from '@ngrx/store';
import { throwError, Observable } from 'rxjs';
import { map, catchError, tap, filter, delay } from 'rxjs/operators';

import { Item } from '../models/eav/item';
import { JsonItem1 } from '../models/json-format-v1/json-item1';
import { EavAttributes, EavValue, EavHeader, EavAttributesTranslated, AdminDialogPersistedData, EavFor } from '../models/eav';

import * as itemActions from '../store/actions/item.actions';
import * as fromStore from '../store';
import { EavValues } from '../models/eav/eav-values';
import { EavDimensions } from '../models/eav/eav-dimensions';
import { AttributeDef } from '../models/eav/attribute-def';
import { InputFieldHelper } from '../helpers/input-field-helper';

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
    items.forEach((jsonItem1: JsonItem1) => {
      const item: Item = Item.create(jsonItem1);
      this.store.dispatch(new itemActions.LoadItemSuccessAction(item));
    });
  }

  public updateItem(attributes: EavAttributes, id: number, guid: string) {
    this.store.dispatch(new itemActions.UpdateItemAction(attributes, id, guid));
  }

  public updateItemAttribute(entityId: number, newEavAttribute: EavValues<any>, attributeKey: string, guid: string) {
    this.store.dispatch(new itemActions.UpdateItemAttributeAction(entityId, newEavAttribute, attributeKey, guid));
  }

  public addItemAttributeValue(entityId: number, newEavAttributeValue: EavValue<any>, attributeKey: string, guid: string, type: string) {
    this.store.dispatch(new itemActions.AddItemAttributeValueAction(entityId, newEavAttributeValue, attributeKey, guid, type));
  }

  public updateItemAttributeValue(entityId: number, attributeKey: string, newEavAttributeValue: string,
    existingDimensionValue: string, defaultLanguage: string, isReadOnly: boolean, guid: string) {
    this.store.dispatch(new itemActions.UpdateItemAttributeValueAction(entityId, attributeKey, newEavAttributeValue,
      existingDimensionValue, defaultLanguage, isReadOnly, guid));
  }

  public updateItemAttributesValues(entityId: number, updateValues: { [key: string]: any },
    languageKey: string, defaultLanguage: string, guid: string) {
    this.store.dispatch(new itemActions.UpdateItemAttributesValuesAction(entityId, updateValues, languageKey, defaultLanguage, guid));
  }

  /**
  * Update entity attribute dimension. Add readonly languageKey to existing useFromLanguageKey.
  * Example to useFrom en-us add fr-fr = "en-us,-fr-fr"
  * */
  public addItemAttributeDimension(entityId: number, attributeKey: string, dimensionValue: string,
    existingDimensionValue: string, defaultLanguage: string, isReadOnly: boolean, guid: string) {
    this.store.dispatch(new itemActions.AddItemAttributeDimensionAction(entityId, attributeKey, dimensionValue,
      existingDimensionValue, defaultLanguage, isReadOnly, guid));
  }

  public removeItemAttributeDimension(entityId: number, attributeKey: string, dimensionValue: string, guid: string) {
    this.store.dispatch(new itemActions.RemoveItemAttributeDimensionAction(entityId, attributeKey, dimensionValue, guid));
  }

  public updateItemHeader(entityId: number, guid: string, header: EavHeader) {
    this.store.dispatch(new itemActions.UpdateItemHeaderAction(entityId, guid, header));
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
    guid: string,
    type: string) {
    let newLanguageValue = languageKey;

    if (isReadOnly) {
      newLanguageValue = `~${languageKey}`;
    }

    const newEavValue = new EavValue(newValue, [new EavDimensions(newLanguageValue)]);

    this.addItemAttributeValue(entityId, newEavValue, attributeKey, guid, type);
  }

  public deleteItem(item: Item) {
    this.store.dispatch(new itemActions.DeleteItemAction(item));
  }

  // public selectAttributeByEntityId(entityId: number, attributeKey: string, guid: string): Observable<EavValues<any>> {
  //   return this.store
  //     .select(fromStore.getItems)
  //     .pipe(map(c => c.find(obj => obj.entity.id === 0 ? obj.header.guid === guid : obj.entity.id === entityId)
  //       ? c.find(obj => obj.entity.id === entityId).entity.attributes[attributeKey]
  //       : null));
  // }

  public selectAttributesByEntityId(entityId: number, guid: string): Observable<EavAttributes> {
    return this.store
      .select(fromStore.getItems)
      .pipe(map(c => c.find(obj => obj.entity.id === 0 ? obj.entity.guid === guid : obj.entity.id === entityId)
        ? c.find(obj => obj.entity.id === 0 ? obj.entity.guid === guid : obj.entity.id === entityId).entity.attributes
        : null));
  }

  public selectAllItems(): Observable<Item[]> {
    return this.store.select(fromStore.getItems);
  }

  public selectItemById(id: number): Observable<Item> {
    return this.store
      .select(fromStore.getItems)
      .pipe(map(data => data.find(obj => obj.entity.id === id)));
  }

  /**
   * Observe header for item from store
   * @param id
   */
  public selectHeaderByEntityId(entityId: number, guid: string): Observable<EavHeader> {
    return this.store
      .select(fromStore.getItems)
      .pipe(map(c => c.find(obj => obj.entity.id === 0 ? obj.entity.guid === guid : obj.entity.id === entityId)
        ? c.find(obj => obj.entity.id === 0 ? obj.entity.guid === guid : obj.entity.id === entityId).header
        : null));
  }
  /**
   * Select items from store by id array list
   * @param idsList
   */
  public selectItemsByIdList(idsList: any[]): Observable<Item[]> {
    return this.store
      .select(fromStore.getItems)
      .pipe(
        delay(0),
        map(data => {
          return data.filter(obj => obj.entity === null || idsList.filter(id => id === obj.entity.id || id === obj.entity.guid).length > 0);
        }));
  }

  /** Set default value and add that attribute in store */
  public setDefaultValue(item: Item, attribute: AttributeDef, inputType: string,
    settingsTranslated: EavAttributesTranslated, currentLanguage: string, defaultLanguage: string): any {
    const defaultValue = InputFieldHelper.parseDefaultValue(attribute.name, inputType, settingsTranslated, item.header);

    const exists = item.entity.attributes.hasOwnProperty(attribute.name);
    if (!exists) {
      this.addAttributeValue(item.entity.id, attribute.name,
        defaultValue, currentLanguage, false, item.entity.guid, attribute.type);
    } else {
      this.updateItemAttributeValue(item.entity.id, attribute.name,
        defaultValue, currentLanguage, defaultLanguage, false, item.entity.guid);
    }
    return defaultValue;
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

  public loadPersistedData(persistedData: AdminDialogPersistedData): void {
    if (!persistedData) {
      return;
    }
    const metadataFor: EavFor = persistedData.metadataFor;
    if (metadataFor) {
      this.addMetadataFor(metadataFor);
    }
  }

  private addMetadataFor(metadataFor: EavFor): void {
    const entityId = 0; // We are adding metadata For to a new entity
    const propertyKey = 'For';
    this.store.dispatch(new itemActions.AddItemEntityProperty(entityId, propertyKey, metadataFor));
  }

  private handleError(error: any) {
    // In a real world app, we might send the error to remote logging infrastructure
    const errMsg = error.message || 'Server error';
    console.error(errMsg);
    return throwError(errMsg);
  }
}
