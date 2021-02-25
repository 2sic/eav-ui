import { Injectable } from '@angular/core';
import { EntityCollectionServiceBase, EntityCollectionServiceElementsFactory } from '@ngrx/data';
import { Observable } from 'rxjs';
import { distinctUntilChanged, map, take } from 'rxjs/operators';
import { FieldSettings } from '../../../../edit-types';
import { DataTypeConstants } from '../../../../ng-dialogs/src/app/content-type-fields/constants/data-type.constants';
import { FieldValue, FormValues } from '../../../eav-item-dialog/item-edit-form/item-edit-form.models';
import { InputFieldHelper } from '../../helpers/input-field-helper';
import { LocalizationHelper } from '../../helpers/localization-helper';
import { Language, SaveResult } from '../../models';
import { EavContentTypeAttribute, EavDimension, EavEntityAttributes, EavHeader, EavItem, EavValue } from '../../models/eav';
import { Item1 } from '../../models/json-format-v1';
import { ContentTypeService } from './content-type.service';
import { InputTypeService } from './input-type.service';

@Injectable({ providedIn: 'root' })
export class ItemService extends EntityCollectionServiceBase<EavItem> {
  constructor(serviceElementsFactory: EntityCollectionServiceElementsFactory) {
    super('Item', serviceElementsFactory);
  }

  loadItems(items1: Item1[]): void {
    const items = items1.map(item1 => EavItem.convert(item1));
    this.upsertManyInCache(items);
  }

  updateItemId(itemData: SaveResult): void {
    const entityGuid = Object.keys(itemData)[0];
    const entityId = itemData[entityGuid];
    let oldItem: EavItem;
    this.entities$.pipe(take(1)).subscribe(items => {
      oldItem = items.find(item => item.Entity.Guid === entityGuid);
    });
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
    const oldItem = this.findItem(entityGuid, transactionItem);

    const newItem: EavItem = {
      ...oldItem,
      Entity: {
        ...oldItem.Entity,
        Attributes: LocalizationHelper.addAttributeValue(oldItem.Entity.Attributes, newEavValue, attributeKey, attributeType),
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
    let oldItem: EavItem;
    this.entities$.pipe(take(1)).subscribe(items => {
      oldItem = items.find(item => item.Entity.Guid === entityGuid);
    });
    if (!oldItem) { return; }

    const newItem: EavItem = {
      ...oldItem,
      Entity: {
        ...oldItem.Entity,
        Attributes: LocalizationHelper.updateAttributeValue(
          oldItem.Entity.Attributes, attributeKey, newValue, currentLanguage, defaultLanguage, isReadOnly,
        ),
      }
    };
    this.updateOneInCache(newItem);
  }

  updateItemAttributesValues(entityGuid: string, newValues: FormValues, currentLanguage: string, defaultLanguage: string): void {
    let oldItem: EavItem;
    this.entities$.pipe(take(1)).subscribe(items => {
      oldItem = items.find(item => item.Entity.Guid === entityGuid);
    });
    if (!oldItem) { return; }

    const changed = Object.entries(oldItem.Entity.Attributes).some(([name, values]) => {
      const oldValue = LocalizationHelper.translate(currentLanguage, defaultLanguage, values, null);
      const newValue = newValues[name];
      return oldValue !== newValue;
    });
    if (!changed) { return; }

    const newItem: EavItem = {
      ...oldItem,
      Entity: {
        ...oldItem.Entity,
        Attributes: LocalizationHelper.updateAttributesValues(oldItem.Entity.Attributes, newValues, currentLanguage, defaultLanguage),
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
    const oldItem = this.findItem(entityGuid, transactionItem);

    const newItem: EavItem = {
      ...oldItem,
      Entity: {
        ...oldItem.Entity,
        Attributes: LocalizationHelper.addAttributeDimension(
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
    const oldItem = this.findItem(entityGuid, transactionItem);

    const newItem: EavItem = {
      ...oldItem,
      Entity: {
        ...oldItem.Entity,
        Attributes: LocalizationHelper.removeAttributeDimension(oldItem.Entity.Attributes, attributeKey, currentLanguage),
      }
    };

    if (!isTransaction) { this.updateOneInCache(newItem); }
    return newItem;
  }

  updateItemHeader(entityGuid: string, header: EavHeader): void {
    let oldItem: EavItem;
    this.entities$.pipe(take(1)).subscribe(items => {
      oldItem = items.find(item => item.Entity.Guid === entityGuid);
    });
    if (!oldItem) { return; }

    const newItem: EavItem = {
      ...oldItem,
      Header: {
        ...header
      }
    };
    this.updateOneInCache(newItem);
  }

  selectItemAttributes(entityGuid: string): Observable<EavEntityAttributes> {
    return this.entities$.pipe(
      map(items => items.find(item => item.Entity.Guid === entityGuid)?.Entity.Attributes),
      distinctUntilChanged(),
    );
  }

  selectAllItems(): Observable<EavItem[]> {
    return this.entities$;
  }

  selectItem(entityGuid: string): Observable<EavItem> {
    return this.entities$.pipe(
      map(items => items.find(item => item.Entity.Guid === entityGuid)),
      distinctUntilChanged(),
    );
  }

  selectItemHeader(entityGuid: string): Observable<EavHeader> {
    return this.entities$.pipe(
      map(items => items.find(item => item.Entity.Guid === entityGuid)?.Header),
      distinctUntilChanged(),
    );
  }

  selectItems(entityGuids: string[]): Observable<EavItem[]> {
    return this.entities$.pipe(
      map(items => items.filter(item => entityGuids.includes(item.Entity.Guid))),
      distinctUntilChanged((oldList, newList) => {
        let isEqual = true;
        if (oldList.length !== newList.length) {
          isEqual = false;
        } else {
          for (let i = 0; i < oldList.length; i++) {
            if (oldList[i] !== newList[i]) {
              isEqual = false;
              break;
            }
          }
        }
        return isEqual;
      }),
    );
  }

  valuesExistInDefaultLanguage(
    entityGuids: string[],
    defaultLanguage: string,
    inputTypeService: InputTypeService,
    contentTypeService: ContentTypeService,
  ): boolean {
    let filteredItems: EavItem[];
    this.entities$.pipe(
      map(items => items.filter(item => entityGuids.includes(item.Entity.Guid))),
      take(1),
    ).subscribe(items => {
      filteredItems = items;
    });

    for (const item of filteredItems) {
      const contentTypeId = InputFieldHelper.getContentTypeId(item);
      const contentType = contentTypeService.getContentType(contentTypeId);

      const attributesValues = Object.keys(item.Entity.Attributes).map(attributeKey => {
        const attribute = contentType.Attributes.find(a => a.Name === attributeKey);
        const inputTypes = inputTypeService.getInputTypes();
        const calculatedInputType = InputFieldHelper.calculateInputType(attribute, inputTypes);
        const disableI18n = LocalizationHelper.isI18nDisabled(inputTypeService, calculatedInputType, attribute.Settings);
        return {
          values: item.Entity.Attributes[attributeKey],
          disableI18n,
        };
      });

      if (attributesValues.length < contentType.Attributes.filter(a => a.Type !== DataTypeConstants.Empty).length) {
        return false;
      }

      for (const attributeValues of attributesValues) {
        const translationExistsInDefault = LocalizationHelper.translationExistsInDefaultStrict(
          attributeValues.values, defaultLanguage, attributeValues.disableI18n,
        );
        if (!translationExistsInDefault) {
          return false;
        }
      }
    }

    return true;
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
    const defaultValue = InputFieldHelper.parseDefaultValue(attribute.Name, inputType, settings, item.Header);
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

  private findItem(entityGuid: string, transactionItem: EavItem): EavItem {
    if (transactionItem != null) { return transactionItem; }

    let oldItem: EavItem;
    this.entities$.pipe(take(1)).subscribe(items => {
      oldItem = items.find(item => item.Entity.Guid === entityGuid);
    });
    return oldItem;
  }
}
