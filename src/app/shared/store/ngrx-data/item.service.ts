import { Injectable } from '@angular/core';
import { EntityCollectionServiceBase, EntityCollectionServiceElementsFactory } from '@ngrx/data';

import { Item, EavValue, EavDimensions } from '../../models/eav';
import { JsonItem1 } from '../../models/json-format-v1';
import { take, map, delay } from 'rxjs/operators';
import { LocalizationHelper } from '../../helpers/localization-helper';

@Injectable({ providedIn: 'root' })
export class ItemService2 extends EntityCollectionServiceBase<Item> {
  constructor(serviceElementsFactory: EntityCollectionServiceElementsFactory) {
    super('Item', serviceElementsFactory);
  }

  // loadItems
  public loadItems(items: JsonItem1[]) {
    items.forEach(jsonItem1 => {
      const item = Item.create(jsonItem1);
      this.addOneToCache(item);
    });
  }
  // addItemAttributeValue / addAttributeValue
  public addAttributeValue(entityId: number, attributeKey: string, newValue: any, languageKey: string,
    isReadOnly: boolean, guid: string, type: string) {
    const newLanguageValue = isReadOnly ? `~${languageKey}` : languageKey;
    const newEavValue = new EavValue(newValue, [new EavDimensions(newLanguageValue)]);
    this.addItemAttributeValue(entityId, newEavValue, attributeKey, guid, type);
  }
  public addItemAttributeValue(entityId: number, newEavAttributeValue: EavValue<any>, attributeKey: string, guid: string, type: string) {
    let oldItem: Item;
    this.entities$.pipe(take(1)).subscribe(items => {
      oldItem = items.find(item => item.entity.id === 0 ? item.entity.guid === guid : item.entity.id === entityId);
    });
    if (!oldItem) { return; }

    const newItem = {
      ...oldItem,
      entity: {
        ...oldItem.entity,
        attributes: LocalizationHelper.addAttributeValue(oldItem.entity.attributes,
          newEavAttributeValue, attributeKey, type)
      }
    };
    this.updateOneInCache(newItem);
  }
  // updateItemAttributeValue
  public updateItemAttributeValue(entityId: number, attributeKey: string, newEavAttributeValue: string,
    existingDimensionValue: string, defaultLanguage: string, isReadOnly: boolean, guid: string) {
    let oldItem: Item;
    this.entities$.pipe(take(1)).subscribe(items => {
      oldItem = items.find(item => item.entity.id === 0 ? item.entity.guid === guid : item.entity.id === entityId);
    });
    if (!oldItem) { return; }

    const newItem = {
      ...oldItem,
      entity: {
        ...oldItem.entity,
        attributes: LocalizationHelper.updateAttributeValue(oldItem.entity.attributes, attributeKey,
          newEavAttributeValue, existingDimensionValue, defaultLanguage, isReadOnly)
      }
    };
    this.updateOneInCache(newItem);
  }
  // updateItemAttributesValues
  public updateItemAttributesValues(entityId: number, updateValues: { [key: string]: any },
    languageKey: string, defaultLanguage: string, guid: string) {
    let oldItem: Item;
    this.entities$.pipe(take(1)).subscribe(items => {
      oldItem = items.find(item => item.entity.id === 0 ? item.entity.guid === guid : item.entity.id === entityId);
    });
    if (!oldItem) { return; }

    const newItem = {
      ...oldItem,
      entity: {
        ...oldItem.entity,
        attributes: LocalizationHelper.updateAttributesValues(oldItem.entity.attributes,
          updateValues, languageKey, defaultLanguage)
      }
    };
    this.updateOneInCache(newItem);
  }
  // addItemAttributeDimension
  /**
   * Update entity attribute dimension. Add readonly languageKey to existing useFromLanguageKey.
   * Example to useFrom en-us add fr-fr = "en-us,-fr-fr"
   */
  public addItemAttributeDimension(entityId: number, attributeKey: string, dimensionValue: string,
    existingDimensionValue: string, defaultLanguage: string, isReadOnly: boolean, guid: string) {
    let oldItem: Item;
    this.entities$.pipe(take(1)).subscribe(items => {
      oldItem = items.find(item => item.entity.id === 0 ? item.entity.guid === guid : item.entity.id === entityId);
    });
    if (!oldItem) { return; }

    const newItem = {
      ...oldItem,
      entity: {
        ...oldItem.entity,
        attributes: LocalizationHelper.addAttributeDimension(oldItem.entity.attributes,
          attributeKey, dimensionValue, existingDimensionValue,
          defaultLanguage, isReadOnly)
      }
    };
    this.updateOneInCache(newItem);
  }
  // removeItemAttributeDimension
  public removeItemAttributeDimension(entityId: number, attributeKey: string, dimensionValue: string, guid: string) {
    let oldItem: Item;
    this.entities$.pipe(take(1)).subscribe(items => {
      oldItem = items.find(item => item.entity.id === 0 ? item.entity.guid === guid : item.entity.id === entityId);
    });
    if (!oldItem) { return; }

    const newItem = {
      ...oldItem,
      entity: {
        ...oldItem.entity,
        attributes: LocalizationHelper.removeAttributeDimension(oldItem.entity.attributes,
          attributeKey, dimensionValue)
      }
    };
    this.updateOneInCache(newItem);
  }

  // selectAttributesByEntityId
  public selectAttributesByEntityId(entityId: number, guid: string) {
    return this.entities$.pipe(
      map(items => {
        const item = items.find(itm => itm.entity.id === 0 ? itm.entity.guid === guid : itm.entity.id === entityId);
        return item ? item.entity.attributes : null;
      })
    );
  }
  // selectAllItems
  public selectAllItems() {
    return this.entities$;
  }
  // selectItemById
  public selectItemById(id: number) {
    return this.entities$.pipe(
      map(items => items.find(item => item.entity.id === id))
    );
  }
  // selectHeaderByEntityId
  /** Observe header for item from store */
  public selectHeaderByEntityId(entityId: number, guid: string) {
    return this.entities$.pipe(
      map(items => {
        const item = items.find(itm => itm.entity.id === 0 ? itm.entity.guid === guid : itm.entity.id === entityId);
        return item ? item.header : null;
      })
    );
  }
  // selectItemsByIdList
  /** Select items from store by id array list */
  public selectItemsByIdList(idsList: any[]) {
    return this.entities$.pipe(
      delay(0),
      map(items =>
        items.filter(item => item.entity === null || idsList.filter(id => id === item.entity.id || id === item.entity.guid).length > 0)
      )
    );
  }
  // setDefaultValue
}
