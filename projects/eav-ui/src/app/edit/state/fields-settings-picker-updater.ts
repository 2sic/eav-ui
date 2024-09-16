import { effect, Signal } from '@angular/core';
import { FieldProps } from './fields-configs.model';
import { computedObj } from '../../shared/signals/signal.utilities';
import { classLog } from '../../shared/logging';
import { PickerItem } from 'projects/edit-types';
import { PickerData } from '../fields/picker/picker-data';

const logSpecs = {
  all: false,
  startSync: true,
  filterRelevant: true,
  transferPickerData: true,
};

/**
 * Simple helper in charge of updating the picker data in the updated/calculated field settings.
 */
export class FieldSettingsPickerUpdater {

  log = classLog({FieldSettingsPickerUpdater}, logSpecs);

  constructor() {} 
  
  startSync(source: Signal<Record<string, FieldProps> | null>) {
    const l = this.log.fnIf('startSync', { source });

    // Only Options to transfer, with change detection on the signal to not fire the effect unnecessarily
    const optsOnly = computedObj('optsOnly', () =>  this.#filterRelevant(source(), 'opts'));

    // Only Selected to transfer, with change detection on the signal to not fire the effect unnecessarily
    const selOnly = computedObj('selOnly', () => this.#filterRelevant(source(), 'sel'));

    // Options-Transfer
    effect(() => this.#transferPickerData(optsOnly(), 'opts'), { allowSignalWrites: true });

    // Selected-Transfer
    effect(() => this.#transferPickerData(selOnly(), 'sel'), { allowSignalWrites: true });

    l.end();
  }

  #filterRelevant(update: Record<string, FieldProps>, part: 'opts' | 'sel'): DataToTransfer[] {
    // Make sure we already have data.
    if (!update) return [];

    // Transfer picker data
    // 1. find all fieldProps with picker data and transfer to pickerData
    const toTransfer = Object.entries(update)
      .filter(([_, v]) => v[part]?.list)
      .map(([field, v]) => ({
        field,
        list: v[part].list,
        pickerData: v.constants.pickerData
      } as const));

    const l = this.log.fnIf('filterRelevant', { count: toTransfer.length, toTransfer }, part);
    return l.rSilent(toTransfer);
  }

  /** Transfer picker data */
  #transferPickerData(update: DataToTransfer[], part: 'opts' | 'sel'): void {
    if (!update.length) return;
    const l = this.log.fnIf('transferPickerData', { count: update.length, toTransfer: update }, `🧪🔁${part}`);

    for (const { field, list, pickerData } of update) {
      l.a('Transfer', { field, list });
      const pd = pickerData();
      const target = part == 'opts' ? pd.optionsOverride : pd.selectedOverride;
      target.set(list);
    }
  }

}

interface DataToTransfer {
  field: string,
  list: PickerItem[],
  pickerData: () => PickerData | null
}