import { Injectable } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { EntityCollectionServiceBase, EntityCollectionServiceElementsFactory } from '@ngrx/data';
import { distinctUntilChanged, map, take } from 'rxjs/operators';
import { FieldSettings } from '../../../../edit-types';
import { DataTypeConstants } from '../../../../ng-dialogs/src/app/content-type-fields/constants/data-type.constants';
import { FieldFormulas } from '../../helpers/formula.models';
import { InputFieldHelper } from '../../helpers/input-field-helper';
import { LocalizationHelper } from '../../helpers/localization-helper';
import { ContentType, EavDimensions, EavHeader, EavValue, EavValues, Item, Language } from '../../models/eav';
import { AttributeDef } from '../../models/eav/attribute-def';
import { SaveResult } from '../../models/eav/save-result.model';
import { JsonItem1 } from '../../models/json-format-v1';
import { ContentTypeService } from './content-type.service';
import { InputTypeService } from './input-type.service';
import { runValueFormulas } from './item.helpers';

@Injectable({ providedIn: 'root' })
export class ItemService extends EntityCollectionServiceBase<Item> {
  constructor(serviceElementsFactory: EntityCollectionServiceElementsFactory) {
    super('Item', serviceElementsFactory);
  }

  loadItems(items: JsonItem1[]) {
    items.forEach(jsonItem1 => {
      const item = Item.create(jsonItem1);
      this.upsertOneInCache(item);
    });
  }

  updateItemId(itemData: SaveResult) {
    const guid = Object.keys(itemData)[0];
    const entityId = itemData[guid];
    let oldItem: Item;
    this.entities$.pipe(take(1)).subscribe(items => {
      oldItem = items.find(item => item.entity.id === 0 ? item.entity.guid === guid : item.entity.id === entityId);
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

  addAttributeValue(entityId: number, attributeKey: string, newValue: any, languageKey: string,
    isReadOnly: boolean, guid: string, type: string) {
    const newLanguageValue = isReadOnly ? `~${languageKey}` : languageKey;
    const newEavValue = new EavValue(newValue, [new EavDimensions(newLanguageValue)]);
    this.addItemAttributeValue(entityId, newEavValue, attributeKey, guid, type);
  }

  addItemAttributeValue(entityId: number, newEavAttributeValue: EavValue<any>, attributeKey: string, guid: string, type: string) {
    let oldItem: Item;
    this.entities$.pipe(take(1)).subscribe(items => {
      oldItem = items.find(item => item.entity.id === 0 ? item.entity.guid === guid : item.entity.id === entityId);
    });
    if (!oldItem) { return; }

    const newItem = {
      ...oldItem,
      entity: {
        ...oldItem.entity,
        attributes: LocalizationHelper.addAttributeValue(oldItem.entity.attributes, newEavAttributeValue, attributeKey, type)
      }
    };
    this.updateOneInCache(newItem);
  }

  updateItemAttributeValue(entityId: number, attributeKey: string, newEavAttributeValue: string,
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

  updateItemAttributesValues(
    entityId: number,
    entityGuid: string,
    form: FormGroup,
    lang: string,
    defaultLang: string,
    formulas: FieldFormulas,
  ) {
    let oldItem: Item;
    this.entities$.pipe(take(1)).subscribe(items => {
      oldItem = items.find(item => item.entity.id === 0 ? item.entity.guid === entityGuid : item.entity.id === entityId);
    });
    if (!oldItem) { return; }

    const newItem = {
      ...oldItem,
      entity: {
        ...oldItem.entity,
        attributes: LocalizationHelper.updateAttributesValues(oldItem.entity.attributes, form.value, lang, defaultLang)
      }
    };
    runValueFormulas(newItem.entity.attributes, form, lang, defaultLang, formulas);
    this.updateOneInCache(newItem);
  }

  /**
   * Update entity attribute dimension. Add readonly languageKey to existing useFromLanguageKey.
   * Example to useFrom en-us add fr-fr = "en-us,-fr-fr"
   */
  addItemAttributeDimension(entityId: number, attributeKey: string, dimensionValue: string,
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
        attributes: LocalizationHelper.addAttributeDimension(oldItem.entity.attributes, attributeKey,
          dimensionValue, existingDimensionValue, defaultLanguage, isReadOnly)
      }
    };
    this.updateOneInCache(newItem);
  }

  removeItemAttributeDimension(entityId: number, attributeKey: string, dimensionValue: string, guid: string) {
    let oldItem: Item;
    this.entities$.pipe(take(1)).subscribe(items => {
      oldItem = items.find(item => item.entity.id === 0 ? item.entity.guid === guid : item.entity.id === entityId);
    });
    if (!oldItem) { return; }

    const newItem = {
      ...oldItem,
      entity: {
        ...oldItem.entity,
        attributes: LocalizationHelper.removeAttributeDimension(oldItem.entity.attributes, attributeKey, dimensionValue)
      }
    };
    this.updateOneInCache(newItem);
  }

  updateItemHeader(entityId: number, guid: string, header: EavHeader) {
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

  selectAttributesByEntityId(entityId: number, guid: string) {
    return this.entities$.pipe(
      map(items => {
        const item = items.find(itm => itm.entity.id === 0 ? itm.entity.guid === guid : itm.entity.id === entityId);
        return item ? item.entity.attributes : null;
      }),
      distinctUntilChanged()
    );
  }

  selectAllItems() {
    return this.entities$;
  }

  selectItemById(id: number) {
    return this.entities$.pipe(
      map(items => items.find(item => item.entity.id === id)),
      distinctUntilChanged()
    );
  }

  /** Observe header for item from store */
  selectHeaderByEntityId(entityId: number, guid: string) {
    return this.entities$.pipe(
      map(items => {
        const item = items.find(itm => itm.entity.id === 0 ? itm.entity.guid === guid : itm.entity.id === entityId);
        return item ? item.header : null;
      }),
      distinctUntilChanged()
    );
  }

  /** Select items from store by id array list */
  selectItemsByIdList(idsList: (number | string)[]) {
    return this.entities$.pipe(
      map(items =>
        items.filter(item => item.entity === null || idsList.filter(id => id === item.entity.id || id === item.entity.guid).length > 0)
      ),
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
      })
    );
  }

  valuesExistInDefaultLanguage(idsList: (number | string)[], defaultLanguage: string, inputTypeService: InputTypeService,
    contentTypeService: ContentTypeService) {
    let valuesExistInDefaultLanguage = true;
    this.entities$.pipe(
      take(1),
      map(items =>
        items.filter(item => item.entity === null || idsList.filter(id => id === item.entity.id || id === item.entity.guid).length > 0)
      ),
    ).subscribe(items => {
      // check if each attribute for each item has value in default dimension
      items.forEach(item => {
        let attributesValues: { values: EavValues<any>; disableI18n: boolean; }[] = [];
        const contentTypeId = InputFieldHelper.getContentTypeId(item);
        let contentType: ContentType;
        contentTypeService.getContentTypeById(contentTypeId).pipe(take(1)).subscribe(type => {
          contentType = type;
        });

        Object.keys(item.entity.attributes).forEach(key => {
          const attributeDef = contentType.contentType.attributes.find(attr => attr.name === key);
          const calculatedInputType = InputFieldHelper.calculateInputType(attributeDef, inputTypeService);
          const disableI18n = LocalizationHelper.isI18nDisabled(inputTypeService, calculatedInputType, attributeDef.settings);
          attributesValues.push({
            values: item.entity.attributes[key],
            disableI18n,
          });
        });

        if (attributesValues.length < contentType.contentType.attributes.filter(cType => cType.type !== DataTypeConstants.Empty).length) {
          valuesExistInDefaultLanguage = false;
        }

        attributesValues.forEach(attributeValues => {
          const translationExistsInDefault = LocalizationHelper.translationExistsInDefaultStrict(
            attributeValues.values, defaultLanguage, attributeValues.disableI18n);
          if (!translationExistsInDefault) { valuesExistInDefaultLanguage = false; }
        });
        attributesValues = null;
      });
    });
    return valuesExistInDefaultLanguage;
  }

  /** Set default value and add that attribute in store */
  setDefaultValue(item: Item, attribute: AttributeDef, inputType: string, settingsTranslated: FieldSettings,
    languages: Language[], currentLanguage: string, defaultLanguage: string) {
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
