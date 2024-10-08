import { FieldSettings } from '../../../../../edit-types/src/FieldSettings';
import { FieldValue } from '../../../../../edit-types/src/FieldValue';
import { InputTypeMetadata } from '../../shared/fields/input-type-metadata.model';
import { classLog } from '../../shared/logging';
import { ItemEditIdentifier, ItemIdentifierHeader } from '../../shared/models/edit-form.model';
import { FormLanguage, Language } from '../form/form-languages.model';
import { FieldReader } from '../localization/field-reader';
import { FieldWriter } from '../localization/field-writer';
import { EntityReader, FieldDefaults } from '../shared/helpers';
import { FieldValueHelpers } from '../shared/helpers/field-value.helpers';
import { EavContentTypeAttribute, EavDimension, EavEntity, EavItem, EavValue } from '../shared/models/eav';
import { ItemValuesOfLanguage } from './item-values-of-language.model';
import { ItemService } from './item.service';
import { SaveResult } from './save-result.model';

const logSpecs = {
  all: true,
  updateItemId: false,
  updateItemHeader: false,
  addItemAttributeValue: false,
  updateItemAttributeValue: false,
  setDefaultValue: false,
  updateItemAttributesValues: false,
  addItemAttributeDimension: false,
  removeItemAttributeDimension: false,
  updateItemMetadata: false,
};

export class ItemUpdateHelper {

  log = classLog({ItemUpdateHelper}, logSpecs);
  
  constructor(private itemSvc: ItemService) { }

  updateItemId(saveResult: SaveResult): void {
    const l = this.log.fnIf('updateItemId', { saveResult });
    const entityGuid = Object.keys(saveResult)[0];
    const entityId = saveResult[entityGuid];
    const oldItem = this.itemSvc.get(entityGuid);
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
    this.itemSvc.add(newItem);
  }


  /** Update parts of the header; ATM just to tell us about the slot being empty */
  updateItemHeader(entityGuid: string, header: ItemIdentifierHeader): void {
    const l = this.log.fnIf('updateItemHeader', { entityGuid, header });
    const oldItem = this.itemSvc.get(entityGuid);
    if (!oldItem) return;

    const newItem: EavItem = {
      ...oldItem,
      Header: {
        ...header
      }
    };
    this.itemSvc.add(newItem);
    l.end();
  }

  //#region Item Attribute - Single Value

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
    const l = this.log.fnIf('addItemAttributeValue', { entityGuid, attributeKey, newValue, currentLanguage, isReadOnly, attributeType, isTransaction, transactionItem });
    const newValueDimension = isReadOnly ? `~${currentLanguage}` : currentLanguage;
    const newEavValue = EavValue.create(newValue, [EavDimension.create(newValueDimension)]);
    const oldItem = transactionItem ?? this.itemSvc.get(entityGuid);

    const newItem: EavItem = {
      ...oldItem,
      Entity: {
        ...oldItem.Entity,
        Attributes: new FieldWriter().addAttributeValue(oldItem.Entity.Attributes, newEavValue, attributeKey, attributeType),
      }
    };

    // if we're in a transaction, then save/update will happen later on, so don't trigger state changes yet
    if (!isTransaction) 
      this.itemSvc.add(newItem);

    return newItem;
  }

  updateItemAttributeValue(
    entityGuid: string,
    attributeKey: string,
    newValue: FieldValue,
    language: FormLanguage,
    isReadOnly: boolean,
  ): void {
    const l = this.log.fnIf('updateItemAttributeValue', { entityGuid, attributeKey, newValue, language, isReadOnly });
    const oldItem = this.itemSvc.get(entityGuid);
    if (!oldItem) return;

    const newItem: EavItem = {
      ...oldItem,
      Entity: {
        ...oldItem.Entity,
        Attributes: new FieldWriter().updateAttributeValue(
          oldItem.Entity.Attributes, attributeKey, newValue, language, isReadOnly,
        ),
      }
    };
    this.itemSvc.add(newItem);
  }

  setDefaultValue(
    item: EavItem,
    ctAttribute: EavContentTypeAttribute,
    inputType: InputTypeMetadata,
    settings: FieldSettings,
    languages: Language[],
    defaultLanguage: string,
  ): FieldValue {
    const l = this.log.fnIf('setDefaultValue', { item, ctAttribute, inputType, settings, languages, defaultLanguage }, `Name: ${ctAttribute.Name}`);
    const defaultValue = new FieldDefaults(ctAttribute.Name, inputType?.Type, settings, item.Header).getDefaultOrPrefillValue();

    // const defaultLanguageValue = LocalizationHelpers.getBestValue(
    //   item.Entity.Attributes[ctAttribute.Name],
    //   defaultLanguage,
    //   // defaultLanguage,
    //   BestValueModes.Strict,
    // );
    const defaultLanguageValue = new FieldReader(item.Entity.Attributes[ctAttribute.Name], defaultLanguage).currentOrDefault?.Value;

    // 2023-08-31 2dm simplified; leave comments in till EOY in case I broke something
    const languageCode = (languages.length === 0 || inputType?.DisableI18n) ? '*' : defaultLanguage;
    if (defaultLanguageValue === undefined) {
      this.addItemAttributeValue(item.Entity.Guid, ctAttribute.Name, defaultValue, languageCode, false, ctAttribute.Type);
    } else {
      // most likely used only for entity fields because we can never know if they were cleaned out or brand new
      this.updateItemAttributeValue(item.Entity.Guid, ctAttribute.Name, defaultValue, { current: languageCode, primary: defaultLanguage }, false);
    }

    // return what was used, so it can be checked on form-init
    return l.r(defaultValue);
  }

  //#endregion

  //#region Item Attribute - Multi Value

  updateItemAttributesValues(entityGuid: string, newValues: ItemValuesOfLanguage, language: FormLanguage): void {
    const l = this.log.fnIf('updateItemAttributesValues', { entityGuid, newValues, language });
    const oldItem = this.itemSvc.get(entityGuid);
    if (!oldItem) return l.end('Item not found');

    const reader = new EntityReader(language);
    const oldValues: ItemValuesOfLanguage = {};
    const relevantValues = Object.entries(oldItem.Entity.Attributes)
      .filter(([name]) => newValues.hasOwnProperty(name));
    for (const [name, values] of relevantValues)
      oldValues[name] = reader.getBestValue(values);

    const changes = FieldValueHelpers.getItemValuesChanges(oldValues, newValues);
    if (changes == null)
      return l.end('No changes');

    const newAttributes = new FieldWriter().updateAttributesValues(oldItem.Entity.Attributes, changes, language);
    const newItem: EavItem = {
      ...oldItem,
      Entity: {
        ...oldItem.Entity,
        Attributes: newAttributes,
      }
    };
    this.itemSvc.add(newItem);
  }

  //#endregion

  //#region Item Value Dimensions

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
    const l = this.log.fnIf('addItemAttributeDimension', { entityGuid, attributeKey, currentLanguage, shareWithLanguage, defaultLanguage, isReadOnly, transactionItem });
    const oldItem = transactionItem ?? this.itemSvc.get(entityGuid);

    const newItem: EavItem = {
      ...oldItem,
      Entity: {
        ...oldItem.Entity,
        Attributes: new FieldWriter().addAttributeDimension(
          oldItem.Entity.Attributes, attributeKey, currentLanguage, shareWithLanguage, defaultLanguage, isReadOnly,
        ),
      }
    };
    this.itemSvc.add(newItem);
  }

  // TODO:: Old Code, remove after testing ist done
  removeItemAttributeDimension(
    entityGuid: string,
    fieldName: string,
    current: string,
    delayUpsert = false,
    transactionItem?: EavItem,
  ): EavItem {
    const l = this.log.fnIf('removeItemAttributeDimension', { entityGuid, attributeKey: fieldName, currentLanguage: current, isTransaction: delayUpsert, transactionItem });
    const oldItem = transactionItem ?? this.itemSvc.get(entityGuid);

    const newItem: EavItem = {
      ...oldItem,
      Entity: {
        ...oldItem.Entity,
        Attributes: new FieldWriter().removeAttributeDimension(oldItem.Entity.Attributes, fieldName, current),
      }
    };

    if (!delayUpsert)
      this.itemSvc.add(newItem);
    return l.r(newItem);
  }

  //#endregion

  //#region Metadata

  updateItemMetadata(entityGuid: string, metadata: EavEntity[]): void {
    const l = this.log.fnIf('updateItemMetadata', { entityGuid, metadata });
    const oldItem = this.itemSvc.get(entityGuid);
    const newItem: EavItem = {
      ...oldItem,
      Entity: {
        ...oldItem.Entity,
        Metadata: metadata,
      }
    };
    this.itemSvc.add(newItem);
    l.end('ok', { newItem });
  }

  //#endregion

}