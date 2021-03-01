import { Injectable } from '@angular/core';
import { EntityCollectionServiceBase, EntityCollectionServiceElementsFactory } from '@ngrx/data';
import { BehaviorSubject, Observable } from 'rxjs';
import { distinctUntilChanged, map } from 'rxjs/operators';
import { FieldSettings } from '../../../../edit-types';
import { FieldValue, FormValues } from '../../../eav-item-dialog/item-edit-form/item-edit-form.models';
import { InputFieldHelpers, LocalizationHelpers } from '../../helpers';
import { GeneralHelpers } from '../../helpers/general.helpers';
import { Language, SaveResult } from '../../models';
import { EavContentTypeAttribute, EavDimension, EavEntityAttributes, EavHeader, EavItem, EavValue } from '../../models/eav';
import { Item1 } from '../../models/json-format-v1';

@Injectable({ providedIn: 'root' })
export class ItemService extends EntityCollectionServiceBase<EavItem> {
  private items$: BehaviorSubject<EavItem[]>;

  constructor(serviceElementsFactory: EntityCollectionServiceElementsFactory) {
    super('Item', serviceElementsFactory);

    this.items$ = new BehaviorSubject<EavItem[]>([]);
    // doesn't need to be completed because store services are singletons that live as long as the browser tab is open
    this.entities$.subscribe(items => {
      this.items$.next(items);
    });
  }

  loadItems(items1: Item1[]): void {
    const items = items1.map(item1 => EavItem.convert(item1));
    this.upsertManyInCache(items);
  }

  updateItemId(itemData: SaveResult): void {
    const entityGuid = Object.keys(itemData)[0];
    const entityId = itemData[entityGuid];
    const oldItem = this.items$.value.find(item => item.Entity.Guid === entityGuid);
    if (!oldItem || (oldItem.Header.EntityId !== 0 && oldItem.Entity.Id !== 0)) { return; }

    const newItem: EavItem = {
      ...oldItem,
      Header: {
        ...oldItem.Header,
        EntityId: entityId,
      },
      Entity: {
        ...oldItem.Entity,
        Id: entityId,
      }
    };
    this.updateOneInCache(newItem);
  }

  addItemAttributeValue(
    entityGuid: string,
    attributeKey: string,
    newValue: FieldValue,
    currentLanguage: string,
    isReadOnly: boolean,
    attributeType: string,
    isTransaction = false,
    transactionItem?: EavItem,
  ): EavItem {
    const newValueDimension = isReadOnly ? `~${currentLanguage}` : currentLanguage;
    const newEavValue = EavValue.create(newValue, [EavDimension.create(newValueDimension)]);
    const oldItem = transactionItem ?? this.items$.value.find(item => item.Entity.Guid === entityGuid);

    const newItem: EavItem = {
      ...oldItem,
      Entity: {
        ...oldItem.Entity,
        Attributes: LocalizationHelpers.addAttributeValue(oldItem.Entity.Attributes, newEavValue, attributeKey, attributeType),
      }
    };

    if (!isTransaction) { this.updateOneInCache(newItem); }
    return newItem;
  }

  updateItemAttributeValue(
    entityGuid: string,
    attributeKey: string,
    newValue: string,
    currentLanguage: string,
    defaultLanguage: string,
    isReadOnly: boolean,
  ): void {
    const oldItem = this.items$.value.find(item => item.Entity.Guid === entityGuid);
    if (!oldItem) { return; }

    const newItem: EavItem = {
      ...oldItem,
      Entity: {
        ...oldItem.Entity,
        Attributes: LocalizationHelpers.updateAttributeValue(
          oldItem.Entity.Attributes, attributeKey, newValue, currentLanguage, defaultLanguage, isReadOnly,
        ),
      }
    };
    this.updateOneInCache(newItem);
  }

  updateItemAttributesValues(entityGuid: string, newValues: FormValues, currentLanguage: string, defaultLanguage: string): void {
    const oldItem = this.items$.value.find(item => item.Entity.Guid === entityGuid);
    if (!oldItem) { return; }

    const oldValues: FormValues = {};
    for (const [name, values] of Object.entries(oldItem.Entity.Attributes)) {
      if (!newValues.hasOwnProperty(name)) { continue; }
      oldValues[name] = LocalizationHelpers.translate(currentLanguage, defaultLanguage, values, null);
    }
    const changes = GeneralHelpers.getFormChanges(oldValues, newValues);
    if (changes == null) { return; }

    const newItem: EavItem = {
      ...oldItem,
      Entity: {
        ...oldItem.Entity,
        Attributes: LocalizationHelpers.updateAttributesValues(oldItem.Entity.Attributes, changes, currentLanguage, defaultLanguage),
      }
    };
    this.updateOneInCache(newItem);
  }

  /**
   * Update entity attribute dimension. Add readonly languageKey to existing useFromLanguageKey.
   * Example to useFrom en-us add fr-fr = "en-us,-fr-fr"
   */
  addItemAttributeDimension(
    entityGuid: string,
    attributeKey: string,
    currentLanguage: string,
    shareWithLanguage: string,
    defaultLanguage: string,
    isReadOnly: boolean,
    transactionItem?: EavItem,
  ): void {
    const oldItem = transactionItem ?? this.items$.value.find(item => item.Entity.Guid === entityGuid);

    const newItem: EavItem = {
      ...oldItem,
      Entity: {
        ...oldItem.Entity,
        Attributes: LocalizationHelpers.addAttributeDimension(
          oldItem.Entity.Attributes, attributeKey, currentLanguage, shareWithLanguage, defaultLanguage, isReadOnly,
        ),
      }
    };
    this.updateOneInCache(newItem);
  }

  removeItemAttributeDimension(
    entityGuid: string,
    attributeKey: string,
    currentLanguage: string,
    isTransaction = false,
    transactionItem?: EavItem,
  ): EavItem {
    const oldItem = transactionItem ?? this.items$.value.find(item => item.Entity.Guid === entityGuid);

    const newItem: EavItem = {
      ...oldItem,
      Entity: {
        ...oldItem.Entity,
        Attributes: LocalizationHelpers.removeAttributeDimension(oldItem.Entity.Attributes, attributeKey, currentLanguage),
      }
    };

    if (!isTransaction) { this.updateOneInCache(newItem); }
    return newItem;
  }

  updateItemHeader(entityGuid: string, header: EavHeader): void {
    const oldItem = this.items$.value.find(item => item.Entity.Guid === entityGuid);
    if (!oldItem) { return; }

    const newItem: EavItem = {
      ...oldItem,
      Header: {
        ...header
      }
    };
    this.updateOneInCache(newItem);
  }

  getItemAttributes(entityGuid: string): EavEntityAttributes {
    return this.items$.value.find(item => item.Entity.Guid === entityGuid)?.Entity.Attributes;
  }

  getItemAttributes$(entityGuid: string): Observable<EavEntityAttributes> {
    return this.items$.pipe(
      map(items => items.find(item => item.Entity.Guid === entityGuid)?.Entity.Attributes),
      distinctUntilChanged(),
    );
  }

  getItem(entityGuid: string): EavItem {
    return this.items$.value.find(item => item.Entity.Guid === entityGuid);
  }

  getItem$(entityGuid: string): Observable<EavItem> {
    return this.items$.pipe(
      map(items => items.find(item => item.Entity.Guid === entityGuid)),
      distinctUntilChanged(),
    );
  }

  getItemHeader$(entityGuid: string): Observable<EavHeader> {
    return this.items$.pipe(
      map(items => items.find(item => item.Entity.Guid === entityGuid)?.Header),
      distinctUntilChanged(),
    );
  }

  getItems(entityGuids?: string[]): EavItem[] {
    if (entityGuids == null) { return this.items$.value; }

    return this.items$.value.filter(item => entityGuids.includes(item.Entity.Guid));
  }

  getItems$(entityGuids?: string[]): Observable<EavItem[]> {
    if (entityGuids == null) { return this.items$.asObservable(); }

    return this.items$.pipe(
      map(items => items.filter(item => entityGuids.includes(item.Entity.Guid))),
      distinctUntilChanged((oldList, newList) => {
        if (oldList.length !== newList.length) { return false; }

        for (let i = 0; i < oldList.length; i++) {
          if (oldList[i] === newList[i]) { continue; }
          return false;
        }
        return true;
      }),
    );
  }

  setDefaultValue(
    item: EavItem,
    attribute: EavContentTypeAttribute,
    inputType: string,
    settings: FieldSettings,
    languages: Language[],
    currentLanguage: string,
    defaultLanguage: string,
  ): FieldValue {
    const defaultValue = InputFieldHelpers.parseDefaultValue(attribute.Name, inputType, settings, item.Header);
    const exists = item.Entity.Attributes.hasOwnProperty(attribute.Name);
    if (!exists) {
      if (languages.length === 0) {
        this.addItemAttributeValue(item.Entity.Guid, attribute.Name, defaultValue, '*', false, attribute.Type, false, null);
      } else {
        this.addItemAttributeValue(item.Entity.Guid, attribute.Name, defaultValue, currentLanguage, false, attribute.Type, false, null);
      }
    } else {
      if (languages.length === 0) {
        this.updateItemAttributeValue(item.Entity.Guid, attribute.Name, defaultValue, '*', defaultLanguage, false);
      } else {
        this.updateItemAttributeValue(item.Entity.Guid, attribute.Name, defaultValue, currentLanguage, defaultLanguage, false);
      }
    }
    return defaultValue;
  }
}
