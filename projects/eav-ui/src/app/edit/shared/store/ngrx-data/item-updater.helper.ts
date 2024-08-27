import { ItemEditIdentifier, ItemIdentifierHeader } from '../../../../shared/models/edit-form.model';
import { SaveResult } from '../../../state/save-result.model';
import { ItemService } from './item.service';
import { EavContentTypeAttribute, EavDimension, EavEntity, EavItem, EavValue } from '../../models/eav';
import { FieldSettings, FieldValue } from '../../../../../../../edit-types';
import { LocalizationHelpers } from '../../../localization/localization.helpers';
import { FormLanguage, Language } from '../../../state/form-languages.model';
import { BestValueModes } from '../../../localization/localization.constants';
import { FieldHelper } from '../../helpers';
import { InputType } from '../../../../content-type-fields/models/input-type.model';
import { EavLogger } from '../../../../shared/logging/eav-logger';
import { ItemValuesOfLanguage } from '../../../state/item-values-of-language.model';
import { ControlHelpers } from '../../helpers/control.helpers';

const logThis = false;
const nameOfThis = 'ItemUpdateHelper';

export class ItemUpdateHelper {

  log = new EavLogger(nameOfThis, logThis);
  
  constructor(private itemSvc: ItemService) {  
  }

  updateItemId(saveResult: SaveResult): void {
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
    const l = this.log.fn('updateItemHeader', { entityGuid, header });
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

  // TODO:: Old Code, remove after testing ist done
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
    const oldItem = transactionItem ?? this.itemSvc.get(entityGuid);

    const newItem: EavItem = {
      ...oldItem,
      Entity: {
        ...oldItem.Entity,
        Attributes: LocalizationHelpers.addAttributeValue(oldItem.Entity.Attributes, newEavValue, attributeKey, attributeType),
      }
    };

    // if we're in a transaction, then save/update will happen later on, so don't trigger state changes yet
    if (!isTransaction) 
      this.itemSvc.add(newItem);

    return newItem;
  }

  // TODO:: Old Code, remove after testing ist done
  updateItemAttributeValue(
    entityGuid: string,
    attributeKey: string,
    newValue: FieldValue,
    language: FormLanguage,
    isReadOnly: boolean,
  ): void {
    const oldItem = this.itemSvc.get(entityGuid);
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
    this.itemSvc.add(newItem);
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

  //#endregion

  //#region Item Attribute - Multi Value

  updateItemAttributesValues(entityGuid: string, newValues: ItemValuesOfLanguage, language: FormLanguage): void {
    const oldItem = this.itemSvc.get(entityGuid);
    if (!oldItem) return;

    const oldValues: ItemValuesOfLanguage = {};
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
    const oldItem = transactionItem ?? this.itemSvc.get(entityGuid);

    const newItem: EavItem = {
      ...oldItem,
      Entity: {
        ...oldItem.Entity,
        Attributes: LocalizationHelpers.addAttributeDimension(
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
    const l = this.log.fn('removeItemAttributeDimension', { entityGuid, attributeKey: fieldName, currentLanguage: current, isTransaction: delayUpsert, transactionItem });
    const oldItem = transactionItem ?? this.itemSvc.get(entityGuid);

    const newItem: EavItem = {
      ...oldItem,
      Entity: {
        ...oldItem.Entity,
        Attributes: LocalizationHelpers.removeAttributeDimension(oldItem.Entity.Attributes, fieldName, current),
      }
    };

    if (!delayUpsert)
      this.itemSvc.add(newItem);
    return l.r(newItem);
  }

  //#endregion

  //#region Metadata

  updateItemMetadata(entityGuid: string, metadata: EavEntity[]): void {
    const oldItem = this.itemSvc.get(entityGuid);
    const newItem: EavItem = {
      ...oldItem,
      Entity: {
        ...oldItem.Entity,
        Metadata: metadata,
      }
    };
    this.itemSvc.add(newItem);
  }

  //#endregion

}