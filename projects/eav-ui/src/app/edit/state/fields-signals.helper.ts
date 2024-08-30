import { signal, Signal } from '@angular/core';
import { EavEntityAttributes, EavItem } from '../shared/models/eav';
import { EntityReader } from '../shared/helpers';
import { ComputedCacheHelper } from '../../shared/helpers/computed-cache';
import { FieldValue } from '../../../../../edit-types';
import { ItemService } from '../shared/store/item.service';
import { EavLogger } from '../../shared/logging/eav-logger';

const logThis = true;
const nameOfThis = 'FieldsSignalsHelper';

export class FieldsSignalsHelper {

  log = new EavLogger(nameOfThis, logThis);

  constructor(private itemSvc: ItemService, private reader: Signal<EntityReader>) {

    // for (const [name, values] of Object.entries(attributes))
    //   this.#fieldValueOrNullSignal(name);
  }

  init(itemGuid: string): this {
    const attributes = this.itemSvc.itemAttributesSignal(itemGuid);
    if (attributes == null)
      console.error('item-entity-attributes is null');

    this.#attributesLazy.set(attributes);
    return this;
  }

  #attributesLazy = signal<Signal<EavEntityAttributes>>(null);

  get(field: string): Signal<FieldValue> {
    const l = this.log.fn('get', { field });
    const sig = this.#fieldValueOrNullSignal(field);
    return l.rSilent(sig);
  }

  #fieldValueSigCache = new ComputedCacheHelper<string, FieldValue>();
  #fieldValueOrNullSignal(fieldName: string): Signal<FieldValue> {
    const l = this.log.fn('#fieldValueOrNullSignal', { fieldName });
    const sig = this.#fieldValueSigCache.getOrCreateWithInfo(fieldName, () => {
      // Do we already have attributes?
      const attrSig = this.#attributesLazy();
      if (attrSig == null)
        return null;

      const attributes = attrSig();
      if (!attributes || Object.keys(attributes).length == 0)
        return null;

      const attribute = attributes[fieldName];
      const values = attribute?.Values;
      if (values == null || values.length == 0)
        return null;

      const value = this.reader().getBestValue(attribute);
      return value as FieldValue;
    });
    return l.rSilent(sig.signal, `isNew: ${sig.isNew}`);
  }

}