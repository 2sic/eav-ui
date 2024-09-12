import { PickerItem } from './models/picker-item.model';
import { StateAdapter } from "./adapters/state-adapter";
import { TranslateService } from '@ngx-translate/core';
import { Injectable, inject } from '@angular/core';
import { PickerFeatures } from './picker-features.model';
import { DataAdapterBase } from './adapters/data-adapter-base';
import { computedObj, signalObj } from '../../../shared/signals/signal.utilities';
import { classLog } from '../../../shared/logging';

/**
 * Manages the data for the picker component.
 * This is quite complex, because there are many combinations of where the configuration and data can come from,
 * as well as how the resulting values should be processed.
 */
@Injectable()
export class PickerData {

  //#region Constructor, Log, Services
  
  log = classLog({PickerData});

  #translate = inject(TranslateService);

  constructor() { }

  //#endregion

  //#region Adapters

  /**
   * The data for the list / options to show.
   * Populated at Setup.
   */
  public source: DataAdapterBase;

  /**
   * The state containing the currently selected data in the correct object structure
   * Populated at Setup.
  */
  public state: StateAdapter;

  //#endregion

  public closeWatcherAttachedWIP = false;

  //#region Possible Options to provide

  #partsReady = signalObj('sourceIsReady', false);


  /** Options to show in the picker. Can also show hints if something is wrong. Must be initialized at setup */
  public optionsSource = computedObj('optionsSource', () => {
    const ready = this.#partsReady();
    return (ready ? this.source.optionsOrHints() : null) ?? [];
  });
  
  public optionsOverride = signalObj<PickerItem[]>('overrideOptions', null);

  /** Final Options to show in the picker and to use to calculate labels of selected etc. */
  public optionsFinal = computedObj('optionsFinal', () => {
    const override = this.optionsOverride();
    if (override) return override;
    return this.optionsSource();
  });

  //#endregion

  //#region Selected Data

  /** Signal containing the currently selected items */
  public selectedState = computedObj('selectedState', () => {
    const ready = this.#partsReady();
    return this.#addInfosFromSourceForUi(ready ? this.state.selectedItems() : [], this.optionsFinal());
  });


  public selectedOverride = signalObj<PickerItem[]>('selectedOverride', null);

  /** Signal containing the currently selected items */
  public selectedAll = computedObj('selectedAll', () => {
    const override = this.selectedOverride();
    if (override) return override;
    return this.selectedState();
  });

  /** Signal containing the first selected item */
  public selectedOne = computedObj('selectedOne', () => this.selectedAll()[0] ?? null);

  //#endregion

  /** Signal containing the features of the picker, basically to accumulate features such as "canEdit" */
  public features = computedObj('features', () => {
    const fromSource = this.source.features();
    const fromState = this.state.features();
    return PickerFeatures.merge(fromSource, fromState);
  });


  /** Setup to load initial values and initialize the state */
  public setup(name: string, state: StateAdapter, source: DataAdapterBase): this {
    source.init(name);
    this.state = state;
    this.source = source;
    this.#partsReady.set(true);
    // 1. Init Prefetch - for Entity Picker
    // This will place the prefetch items into the available-items list
    // Otherwise related entities would only show as GUIDs.
    const initiallySelected = state.selectedItems();
    this.log.a('setup', { initiallySelected })
    source.initPrefetch(initiallySelected.map(item => item.value));
    return this;
  }

  public addNewlyCreatedItem(result: Record<string, number>) {
    const newItemGuid = Object.keys(result)[0];
    const l = this.log.fn('addNewlyCreatedItem', { result, newItemGuid });
    if (!this.state.asArray().includes(newItemGuid)) {
      this.state.add(newItemGuid);
      this.source.forceReloadData([newItemGuid]);
    }
    l.end();
  }

  #addInfosFromSourceForUi(selected: PickerItem[], opts: PickerItem[]): PickerItem[] {
    const result = selected.map(item => {
      // If the selected item is not in the data, show the raw / original item
      const original = opts.find(e => e.value === item.value);
      if (!original)
        return item;
      
      // Since we seem to have more information from the source, use that
      const label = original.label ?? this.#translate.instant('Fields.Picker.EntityNotFound');
      return {
        id: original.id,
        value: original.value,
        label,
        tooltip: original.tooltip || `${label} (${original.value})`,
        infoBox: original.infoBox || '',
        noEdit: original.noEdit === true,
        noDelete: original.noDelete === true,
        noSelect: false,
      } satisfies PickerItem;
    });
    return result;
  }
}
