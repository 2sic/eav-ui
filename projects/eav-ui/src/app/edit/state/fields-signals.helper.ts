import { Signal } from '@angular/core';
import { EavItem } from '../shared/models/eav';
import { EntityReader } from '../shared/helpers';
import { ComputedCacheHelper } from '../../shared/helpers/computed-cache';
import { FieldValue } from '../../../../../edit-types';
import { ItemService } from '../shared/store/item.service';

const logThis = false;
const nameOfThis = 'FieldsSignalsHelper';

export class FieldsSignalsHelper {
  constructor(
    itemGuid: string,
    private item: Signal<EavItem>,
    private reader: Signal<EntityReader>,
    itemSvc: ItemService,
  ) {
    var attributes = itemSvc.itemAttributesSignal(itemGuid);
    if (attributes == null)
      console.error('item-entity-attributes is null');

    for (const [name, values] of Object.entries(attributes))
      this.fieldValueSignalOrNull(name);
  }

  #fieldValueSignals = new ComputedCacheHelper<string, FieldValue>();
  fieldValueSignalOrNull(fieldName: string): Signal<FieldValue> {
    return this.#fieldValueSignals.getOrCreate(fieldName, () => {
      const item = this.item()?.Entity.Attributes;
      if (!item || Object.keys(item).length == 0)
        return null;

      const attribute = item[fieldName];
      const values = attribute?.Values;
      if (values == null || values.length == 0)
        return null;

      var value = this.reader().getBestValue(attribute);
      return value as FieldValue;
    });
  }

}