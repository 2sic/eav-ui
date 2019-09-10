import { Injectable } from '@angular/core';
import { EntityCollectionServiceBase, EntityCollectionServiceElementsFactory } from '@ngrx/data';

import { Item, EavValue, EavDimensions, FieldSettings, Language, EavHeader } from '../../models/eav';
import { JsonItem1 } from '../../models/json-format-v1';
import { take, map, delay, distinctUntilChanged } from 'rxjs/operators';
import { LocalizationHelper } from '../../helpers/localization-helper';
import { AttributeDef } from '../../models/eav/attribute-def';
import { InputFieldHelper } from '../../helpers/input-field-helper';

@Injectable({ providedIn: 'root' })
export class ItemService extends EntityCollectionServiceBase<Item> {
  constructor(serviceElementsFactory: EntityCollectionServiceElementsFactory) {
    super('Item', serviceElementsFactory);
  }

  public loadItems(items: JsonItem1[]) {
    items.forEach(jsonItem1 => {
      const item = Item.create(jsonItem1);
      this.addOneToCache(item);
    });
  }

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

  public updateItemHeader(entityId: number, guid: string, header: EavHeader) {
    let oldItem: Item;
    this.entities$.pipe(take(1)).subscribe(items => {
      oldItem = items.find(item => item.entity.id === 0 ? item.entity.guid === guid : item.entity.id === entityId);
    });
    if (!oldItem) { return; }

    const newItem = {
      ...oldItem,
      header: {
        ...header
      }
    };
    this.updateOneInCache(newItem);
  }

  public selectAttributesByEntityId(entityId: number, guid: string) {
    return this.entities$.pipe(
      map(items => {
        const item = items.find(itm => itm.entity.id === 0 ? itm.entity.guid === guid : itm.entity.id === entityId);
        return item ? item.entity.attributes : null;
      }),
      distinctUntilChanged()
    );
  }

  public selectAllItems() {
    return this.entities$;
  }

  public selectItemById(id: number) {
    return this.entities$.pipe(
      map(items => items.find(item => item.entity.id === id)),
      distinctUntilChanged()
    );
  }

  /** Observe header for item from store */
  public selectHeaderByEntityId(entityId: number, guid: string) {
    return this.entities$.pipe(
      map(items => {
        const item = items.find(itm => itm.entity.id === 0 ? itm.entity.guid === guid : itm.entity.id === entityId);
        return item ? item.header : null;
      }),
      distinctUntilChanged()
    );
  }

  /** Select items from store by id array list */
  public selectItemsByIdList(idsList: any[]) {
    return this.entities$.pipe(
      delay(0),
      map(items =>
        items.filter(item => item.entity === null || idsList.filter(id => id === item.entity.id || id === item.entity.guid).length > 0)
      ),
      distinctUntilChanged((oldList, newList) => {
        let oldIds = '';
        let newIds = '';
        oldList.forEach(item => {
          oldIds += item.entity.id;
        });
        newList.forEach(item => {
          newIds += item.entity.id;
        });
        return oldIds === newIds;
      })
    );
  }

  /** Set default value and add that attribute in store */
  public setDefaultValue(item: Item, attribute: AttributeDef, inputType: string, settingsTranslated: FieldSettings,
    languages: Language[], currentLanguage: string, defaultLanguage: string): any {
    const defaultValue = InputFieldHelper.parseDefaultValue(attribute.name, inputType, settingsTranslated, item.header);

    const exists = item.entity.attributes.hasOwnProperty(attribute.name);
    if (!exists) {
      if (languages.length === 0) {
        this.addAttributeValue(item.entity.id, attribute.name,
          defaultValue, '*', false, item.entity.guid, attribute.type);
      } else {
        this.addAttributeValue(item.entity.id, attribute.name,
          defaultValue, currentLanguage, false, item.entity.guid, attribute.type);
      }
    } else {
      if (languages.length === 0) {
        this.updateItemAttributeValue(item.entity.id, attribute.name,
          defaultValue, '*', defaultLanguage, false, item.entity.guid);
      } else {
        this.updateItemAttributeValue(item.entity.id, attribute.name,
          defaultValue, currentLanguage, defaultLanguage, false, item.entity.guid);
      }
    }
    return defaultValue;
  }
}
