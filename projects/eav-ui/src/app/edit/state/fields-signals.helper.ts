import { effect, Injectable, Signal } from '@angular/core';
import { FieldValue } from '../../../../../edit-types/src/FieldValue';
import { difference } from '../../shared/helpers/difference';
import { classLog } from '../../shared/logging';
import { ComputedCacheHelper } from '../../shared/signals/computed-cache';
import { computedObj, signalObj } from '../../shared/signals/signal.utilities';
import { EntityReader } from '../shared/helpers';
import { EavEntityAttributes } from '../shared/models/eav';
import { ItemService } from './item.service';

@Injectable()
export class FieldsSignalsHelper {

  log = classLog({FieldsSignalsHelper}, {
    logChanges: false,
  });

  constructor(private itemSvc: ItemService) {
    if (this.log.specs.logChanges) {
      const lChange = classLog('FieldValues');
      lChange.a('will log value changes');
      let before: Record<string, FieldValue> = {};
      effect(() => {
        const guid = this.#itemGuid();
        if (!guid) return lChange.a('no guid');
        const all = this.values();
        const changes = difference(all, before);
        before = all;
        lChange.a(`changed on guid: ${guid}`, changes);
      });
    }
  }

  #reader: Signal<EntityReader>;
  #itemGuid = signalObj<string>('itemGuid', null);

  init(itemGuid: string, reader: Signal<EntityReader>): this {
    this.#itemGuid.set(itemGuid);
    this.#fieldValueSigCache = new ComputedCacheHelper(itemGuid);
    this.#reader = reader;
    const attributes = this.itemSvc.itemAttributesSignal(itemGuid);
    if (attributes == null)
      console.error('item-entity-attributes is null');

    this.#attributesLazy.set(attributes);
    return this;
  }

  #attributesLazy = signalObj<Signal<EavEntityAttributes>>('attributesLazy', null);

  get values(): Signal<Record<string, FieldValue>> {
    const lGet = this.log.fn('get-values', { itemGuid: this.#itemGuid });
    if (this.#values != null)
      return lGet.rSilent(this.#values, 'cached');

    const sig = this.#createValuesSignal();
    this.#values = sig;
    return lGet.rSilent(this.#values, 'generated');
  }
  #values: Signal<Record<string, FieldValue>>;

  #createValuesSignal() {
    const sig = computedObj(`${this.#itemGuid().substring(0, 8)}-ALL`, () => {
      const l = this.log.fn('values');

      // Track dependencies early
      const reader = this.#reader();
      const attrSig = this.#attributesLazy();

      if (attrSig == null)
        return l.r({}, 'attributes is null');

      const attributes = attrSig();
      if (!attributes || Object.keys(attributes).length == 0)
        return l.r({}, 'attributes is empty');

      const values = reader.currentValues(attributes);
      return values
    });
    return sig;
  }


  get(field: string): Signal<FieldValue> {
    const l = this.log.fn('get', { field });
    const sig = this.#fieldValueOrNullSignal(field);
    return l.rSilent(sig);
  }

  #fieldValueSigCache: ComputedCacheHelper<string, FieldValue>;

  #fieldValueOrNullSignal(fieldName: string): Signal<FieldValue> {
    // TODO: REFACTOR - TO USE THE new value signal

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

      const value = this.#reader().getBestValue(attribute);
      return value as FieldValue;
    });
    return l.rSilent(sig.signal, `isNew: ${sig.isNew}`);
  }

}