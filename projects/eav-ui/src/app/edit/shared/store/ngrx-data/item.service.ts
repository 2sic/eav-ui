import { computed, Injectable, Injector, Signal } from '@angular/core';
import { EntityCollectionServiceElementsFactory } from '@ngrx/data';
import { map, Observable } from 'rxjs';
import { FieldSettings, FieldValue } from '../../../../../../../edit-types';
import { InputType } from '../../../../content-type-fields/models/input-type.model';
import { eavConstants } from '../../../../shared/constants/eav.constants';
import { FieldHelper } from '../../helpers';
import { ItemValuesOfOneLanguage, Language, SaveResult } from '../../models';
import { EavContentTypeAttribute, EavDimension, EavEntity, EavEntityAttributes, EavFor, EavItem, EavValue } from '../../models/eav';
import { EavEntityBundleDto } from '../../models/json-format-v1';
import { BaseDataService } from './base-data.service';
import { FormLanguage } from '../../models/form-languages.model';
import { ControlHelpers } from '../../helpers/control.helpers';
import { LocalizationHelpers } from '../../../localization/localization.helpers';
import { ItemEditIdentifier, ItemIdentifierHeader } from '../../../../shared/models/edit-form.model';
import { EavLogger } from '../../../../shared/logging/eav-logger';
import { RxHelpers } from '../../../../shared/rxJs/rx.helpers';
import { mapUntilChanged, mapUntilObjChanged } from '../../../../shared/rxJs/mapUntilChanged';
import { BestValueModes } from '../../../localization/localization.constants';

const logThis = false;
const nameOfThis = 'ItemService';

@Injectable({ providedIn: 'root' })
export class ItemService extends BaseDataService<EavItem> {
  log = new EavLogger(nameOfThis, logThis);
  constructor(serviceElementsFactory: EntityCollectionServiceElementsFactory) {
    super('Item', serviceElementsFactory);
  }

  loadItems(dtoItems: EavEntityBundleDto[]): void {
    const items = dtoItems.map(item => EavItem.convert(item));
    this.upsertManyInCache(items);
  }

  updateItemId(itemData: SaveResult): void {
    const entityGuid = Object.keys(itemData)[0];
    const entityId = itemData[entityGuid];
    const oldItem = this.cache().find(item => item.Entity.Guid === entityGuid);
    if (!oldItem || ((oldItem.Header as ItemEditIdentifier).EntityId !== 0 && oldItem.Entity.Id !== 0))
      return;

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

  updateItemMetadata(entityGuid: string, metadata: EavEntity[]): void {
    const oldItem = this.cache().find(item => item.Entity.Guid === entityGuid);
    const newItem: EavItem = {
      ...oldItem,
      Entity: {
        ...oldItem.Entity,
        Metadata: metadata,
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
    const oldItem = transactionItem ?? this.cache().find(item => item.Entity.Guid === entityGuid);

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
    newValue: FieldValue,
    language: FormLanguage,
    isReadOnly: boolean,
  ): void {
    const oldItem = this.cache().find(item => item.Entity.Guid === entityGuid);
    if (!oldItem) return;

    const newItem: EavItem = {
      ...oldItem,
      Entity: {
        ...oldItem.Entity,
        Attributes: LocalizationHelpers.updateAttributeValue(
          oldItem.Entity.Attributes, attributeKey, newValue, language, isReadOnly,
        ),
      }
    };
    this.updateOneInCache(newItem);
  }

  updateItemAttributesValues(entityGuid: string, newValues: ItemValuesOfOneLanguage, language: FormLanguage): void {
    const oldItem = this.cache().find(item => item.Entity.Guid === entityGuid);
    if (!oldItem) return;

    const oldValues: ItemValuesOfOneLanguage = {};
    for (const [name, values] of Object.entries(oldItem.Entity.Attributes)) {
      if (!newValues.hasOwnProperty(name))
        continue;
      oldValues[name] = LocalizationHelpers.translate(language, values, null);
    }
    const changes = ControlHelpers.getFormChanges(oldValues, newValues);
    if (changes == null)
      return;

    const newItem: EavItem = {
      ...oldItem,
      Entity: {
        ...oldItem.Entity,
        Attributes: LocalizationHelpers.updateAttributesValues(oldItem.Entity.Attributes, changes, language),
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
    const oldItem = transactionItem ?? this.cache().find(item => item.Entity.Guid === entityGuid);

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
    fieldName: string,
    current: string,
    delayUpsert = false,
    transactionItem?: EavItem,
  ): EavItem {
    const l = this.log.fn('removeItemAttributeDimension', { entityGuid, attributeKey: fieldName, currentLanguage: current, isTransaction: delayUpsert, transactionItem });
    const oldItem = transactionItem ?? this.cache().find(item => item.Entity.Guid === entityGuid);

    const newItem: EavItem = {
      ...oldItem,
      Entity: {
        ...oldItem.Entity,
        Attributes: LocalizationHelpers.removeAttributeDimension(oldItem.Entity.Attributes, fieldName, current),
      }
    };

    if (!delayUpsert)
      this.updateOneInCache(newItem);
    return l.r(newItem);
  }

  updateItemHeader(entityGuid: string, header: ItemIdentifierHeader): void {
    const l = this.log.fn('updateItemHeader', { entityGuid, header });
    const oldItem = this.cache().find(item => item.Entity.Guid === entityGuid);
    if (!oldItem) return;

    const newItem: EavItem = {
      ...oldItem,
      Header: {
        ...header
      }
    };
    this.updateOneInCache(newItem);
    l.end();
  }

  getItem(entityGuid: string): EavItem {
    return this.cache().find(item => item.Entity.Guid === entityGuid);
  }

  item(entityGuid: string): Signal<EavItem> {
    // try cached signal first
    return this.#itemCache[entityGuid]
      ? this.#itemCache[entityGuid]
      : this.#itemCache[entityGuid] = computed(
          () => this.cache().find(item => item.Entity.Guid === entityGuid),
          { equal: RxHelpers.objectsEqual },
        );
  }
  #itemCache: Record<string, Signal<EavItem>> = {};

  itemAttributes(entityGuid: string): Signal<EavEntityAttributes> {
    const l = this.log.fn('itemAttributes', { entityGuid });
    // try cached signal first
    return this.#itemAttributesCache[entityGuid]
      ? l.r(this.#itemAttributesCache[entityGuid], 'cached')
      : this.#itemAttributesCache[entityGuid] = computed(
          () => this.item(entityGuid)()?.Entity.Attributes,
          { equal: RxHelpers.objectsEqual },
        );
  }
  #itemAttributesCache: Record<string, Signal<EavEntityAttributes>> = {};

  getItemAttributes(entityGuid: string): EavEntityAttributes {
    const l = this.log.fn('getItemAttributes', { entityGuid });
    const result = this.cache().find(item => item.Entity.Guid === entityGuid)?.Entity.Attributes;
    return l.r(result);
  }

  getItemAttributes$(entityGuid: string): Observable<EavEntityAttributes> {
    return this.cache$.pipe(
      map(items => items.find(item => item.Entity.Guid === entityGuid)?.Entity.Attributes),
      mapUntilChanged(m => m),
    );
  }

  /** Sync get-item-for info to show metadata-target info on an entity in the UI */
  getItemFor(entityGuid: string): EavFor {
    return this.cache().find(item => item.Entity.Guid === entityGuid)?.Entity.For;
  }

  getItemNote(entityGuid: string): EavEntity {
    return this.cache()
      .find(item => item.Entity.Guid === entityGuid)?.Entity.Metadata
      ?.find(metadata => metadata.Type.Name === eavConstants.contentTypes.notes);
  }

  getItemHeader(entityGuid: string): ItemIdentifierHeader {
    return this.cache().find(item => item.Entity.Guid === entityGuid)?.Header;
  };

  getItemHeader$(entityGuid: string): Observable<ItemIdentifierHeader> {
    return this.cache$.pipe(
      map(items => items.find(item => item.Entity.Guid === entityGuid)?.Header),
      mapUntilObjChanged(m => m),
    );
  }

  slotIsEmpty(entityGuid: string): Signal<boolean> {
    // prepare signal before creating computed so it doesn't get recreated
    const itemHeader = this.item(entityGuid);
    return computed(() => {
      const header = itemHeader()?.Header;
      return header == null ? true : header.IsEmptyAllowed && header.IsEmpty;
    });
  }

  getItems(entityGuids?: string[]): EavItem[] {
    if (entityGuids == null) { return this.cache(); }

    return this.cache().filter(item => entityGuids.includes(item.Entity.Guid));
  }

  getItems$(entityGuids?: string[]): Observable<EavItem[]> {
    if (entityGuids == null) { return this.cache$.asObservable(); }

    return this.cache$.pipe(
      map(items => items.filter(item => entityGuids.includes(item.Entity.Guid))),
      mapUntilObjChanged(m => m),
      // distinctUntilChanged(RxHelpers.arraysEqual),
    );
  }

  setDefaultValue(
    item: EavItem,
    ctAttribute: EavContentTypeAttribute,
    inputType: InputType,
    settings: FieldSettings,
    languages: Language[],
    defaultLanguage: string,
  ): FieldValue {
    const l = this.log.fn('setDefaultValue', { item, ctAttribute, inputType, settings, languages, defaultLanguage }, `Name: ${ctAttribute.Name}`);
    const defaultValue = FieldHelper.getDefaultOrPrefillValue(ctAttribute.Name, inputType?.Type, settings, item.Header);

    const defaultLanguageValue = LocalizationHelpers.getBestValue(
      item.Entity.Attributes[ctAttribute.Name],
      defaultLanguage,
      defaultLanguage,
      BestValueModes.Strict,
    );
    // 2023-08-31 2dm simplified; leave comments in till EOY in case I broke something
    const languageCode = (languages.length === 0 || inputType?.DisableI18n) ? '*' : defaultLanguage;
    if (defaultLanguageValue === undefined) {
      this.addItemAttributeValue(item.Entity.Guid, ctAttribute.Name, defaultValue, languageCode, false, ctAttribute.Type);
    } else {
      // most likely used only for entity fields because we can never know if they were cleaned out or brand new
      this.updateItemAttributeValue(item.Entity.Guid, ctAttribute.Name, defaultValue, { current: languageCode, primary: defaultLanguage }, false);
    }

    // return what was used, so it can be checked on form-init
    return defaultValue;
  }
}
