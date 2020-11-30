import { Injectable } from '@angular/core';
import { EntityCollectionServiceBase, EntityCollectionServiceElementsFactory } from '@ngrx/data';
import { distinctUntilChanged, map, take } from 'rxjs/operators';
import { FieldSettings } from '../../../../edit-types';
import { DataTypeConstants } from '../../../../ng-dialogs/src/app/content-type-fields/constants/data-type.constants';
import { FormValue, FormValues } from '../../../eav-item-dialog/item-edit-form/item-edit-form.models';
import { InputFieldHelper } from '../../helpers/input-field-helper';
import { LocalizationHelper } from '../../helpers/localization-helper';
import { ContentType, EavDimensions, EavHeader, EavValue, Item, Language } from '../../models/eav';
import { AttributeDef } from '../../models/eav/attribute-def';
import { SaveResult } from '../../models/eav/save-result.model';
import { JsonItem1 } from '../../models/json-format-v1';
import { ContentTypeService } from './content-type.service';
import { InputTypeService } from './input-type.service';

@Injectable({ providedIn: 'root' })
export class ItemService extends EntityCollectionServiceBase<Item> {
  constructor(serviceElementsFactory: EntityCollectionServiceElementsFactory) {
    super('Item', serviceElementsFactory);
  }

  loadItems(jsonItems: JsonItem1[]) {
    const items = jsonItems.map(jsonItem => Item.create(jsonItem));
    this.upsertManyInCache(items);
  }

  updateItemId(itemData: SaveResult) {
    const entityGuid = Object.keys(itemData)[0];
    const entityId = itemData[entityGuid];
    let oldItem: Item;
    this.entities$.pipe(take(1)).subscribe(items => {
      oldItem = items.find(item => item.entity.guid === entityGuid);
    });
    if (!oldItem || (oldItem.header.EntityId !== 0 && oldItem.entity.id !== 0)) { return; }

    const newItem = {
      ...oldItem,
      header: {
        ...oldItem.header,
        entityId
      },
      entity: {
        ...oldItem.entity,
        id: entityId
      }
    };
    this.updateOneInCache(newItem);
  }

  addItemAttributeValue(
    entityGuid: string,
    attributeKey: string,
    newValue: FormValue,
    language: string,
    isReadOnly: boolean,
    attributeType: string,
  ) {
    const newValueDimension = isReadOnly ? `~${language}` : language;
    const newEavValue = new EavValue(newValue, [new EavDimensions(newValueDimension)]);

    let oldItem: Item;
    this.entities$.pipe(take(1)).subscribe(items => {
      oldItem = items.find(item => item.entity.guid === entityGuid);
    });
    if (!oldItem) { return; }

    const newItem = {
      ...oldItem,
      entity: {
        ...oldItem.entity,
        attributes: LocalizationHelper.addAttributeValue(oldItem.entity.attributes, newEavValue, attributeKey, attributeType),
      }
    };
    this.updateOneInCache(newItem);
  }

  updateItemAttributeValue(
    entityGuid: string,
    attributeKey: string,
    newValue: string,
    language: string,
    defaultLanguage: string,
    isReadOnly: boolean,
  ) {
    let oldItem: Item;
    this.entities$.pipe(take(1)).subscribe(items => {
      oldItem = items.find(item => item.entity.guid === entityGuid);
    });
    if (!oldItem) { return; }

    const newItem = {
      ...oldItem,
      entity: {
        ...oldItem.entity,
        attributes: LocalizationHelper.updateAttributeValue(
          oldItem.entity.attributes, attributeKey, newValue, language, defaultLanguage, isReadOnly,
        ),
      }
    };
    this.updateOneInCache(newItem);
  }

  updateItemAttributesValues(entityGuid: string, newValues: FormValues, language: string, defaultLanguage: string) {
    let oldItem: Item;
    this.entities$.pipe(take(1)).subscribe(items => {
      oldItem = items.find(item => item.entity.guid === entityGuid);
    });
    if (!oldItem) { return; }

    const newItem = {
      ...oldItem,
      entity: {
        ...oldItem.entity,
        attributes: LocalizationHelper.updateAttributesValues(oldItem.entity.attributes, newValues, language, defaultLanguage),
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
    language: string,
    shareWithLanguage: string,
    defaultLanguage: string,
    isReadOnly: boolean,
  ) {
    let oldItem: Item;
    this.entities$.pipe(take(1)).subscribe(items => {
      oldItem = items.find(item => item.entity.guid === entityGuid);
    });
    if (!oldItem) { return; }

    const newItem = {
      ...oldItem,
      entity: {
        ...oldItem.entity,
        attributes: LocalizationHelper.addAttributeDimension(
          oldItem.entity.attributes, attributeKey, language, shareWithLanguage, defaultLanguage, isReadOnly,
        ),
      }
    };
    this.updateOneInCache(newItem);
  }

  removeItemAttributeDimension(entityGuid: string, attributeKey: string, language: string) {
    let oldItem: Item;
    this.entities$.pipe(take(1)).subscribe(items => {
      oldItem = items.find(item => item.entity.guid === entityGuid);
    });
    if (!oldItem) { return; }

    const newItem = {
      ...oldItem,
      entity: {
        ...oldItem.entity,
        attributes: LocalizationHelper.removeAttributeDimension(oldItem.entity.attributes, attributeKey, language)
      }
    };
    this.updateOneInCache(newItem);
  }

  updateItemHeader(entityGuid: string, header: EavHeader) {
    let oldItem: Item;
    this.entities$.pipe(take(1)).subscribe(items => {
      oldItem = items.find(item => item.entity.guid === entityGuid);
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

  selectItemAttributes(entityGuid: string) {
    return this.entities$.pipe(
      map(items => items.find(item => item.entity.guid === entityGuid)?.entity.attributes),
      distinctUntilChanged(),
    );
  }

  selectAllItems() {
    return this.entities$;
  }

  selectItem(entityGuid: string) {
    return this.entities$.pipe(
      map(items => items.find(item => item.entity.guid === entityGuid)),
      distinctUntilChanged(),
    );
  }

  selectItemHeader(entityGuid: string) {
    return this.entities$.pipe(
      map(items => items.find(item => item.entity.guid === entityGuid)?.header),
      distinctUntilChanged(),
    );
  }

  selectItems(entityGuids: string[]) {
    return this.entities$.pipe(
      map(items => items.filter(item => entityGuids.includes(item.entity.guid))),
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
  ) {
    let filteredItems: Item[];
    this.entities$.pipe(
      map(items => items.filter(item => entityGuids.includes(item.entity.guid))),
      take(1),
    ).subscribe(items => {
      filteredItems = items;
    });

    for (const item of filteredItems) {
      const contentTypeId = InputFieldHelper.getContentTypeId(item);
      let contentType: ContentType;
      contentTypeService.getContentTypeById(contentTypeId).pipe(take(1)).subscribe(type => {
        contentType = type;
      });

      const attributesValues = Object.keys(item.entity.attributes).map(attributeKey => {
        const attributeDef = contentType.contentType.attributes.find(attr => attr.name === attributeKey);
        const calculatedInputType = InputFieldHelper.calculateInputType(attributeDef, inputTypeService);
        const disableI18n = LocalizationHelper.isI18nDisabled(inputTypeService, calculatedInputType, attributeDef.settings);
        return {
          values: item.entity.attributes[attributeKey],
          disableI18n,
        };
      });

      if (attributesValues.length < contentType.contentType.attributes.filter(cType => cType.type !== DataTypeConstants.Empty).length) {
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
    item: Item,
    attributeDef: AttributeDef,
    inputType: string,
    settings: FieldSettings,
    languages: Language[],
    language: string,
    defaultLanguage: string,
  ) {
    const defaultValue = InputFieldHelper.parseDefaultValue(attributeDef.name, inputType, settings, item.header);
    const exists = item.entity.attributes.hasOwnProperty(attributeDef.name);
    if (!exists) {
      if (languages.length === 0) {
        this.addItemAttributeValue(item.entity.guid, attributeDef.name, defaultValue, '*', false, attributeDef.type);
      } else {
        this.addItemAttributeValue(item.entity.guid, attributeDef.name, defaultValue, language, false, attributeDef.type);
      }
    } else {
      if (languages.length === 0) {
        this.updateItemAttributeValue(item.entity.guid, attributeDef.name, defaultValue, '*', defaultLanguage, false);
      } else {
        this.updateItemAttributeValue(item.entity.guid, attributeDef.name, defaultValue, language, defaultLanguage, false);
      }
    }
    return defaultValue;
  }

}
