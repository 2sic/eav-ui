import { Injectable, inject } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { getWith } from '../../../core';
import { classLog } from '../../../shared/logging';
import { computedObj, signalObj } from '../../../shared/signals/signal.utilities';
import { DebugFields } from '../../edit-debug';
import { DataAdapterBase } from './adapters/data-adapter-base';
import { StateAdapter } from "./adapters/state-adapter";
import { PickerItem } from './models/picker-item.model';
import { PickerFeatures } from './picker-features.model';

const logSpecs = {
  all: true,
  setup: true,
  addInfosFromSourceForUi: true,
  optionsWithMissing: true,
  selectedRaw: false,
  selectedOverride: false,
  selectedState: false,
  fields: [...DebugFields],
}
/**
 * Manages the data for the picker component.
 * This is quite complex, because there are many combinations of where the configuration and data can come from,
 * as well as how the resulting values should be processed.
 */
@Injectable()
export class PickerData {

  //#region Constructor, Log, Services, Setup
  
  log = classLog({PickerData}, logSpecs);

  #translate = inject(TranslateService);

  name: string;

  constructor() { }

  /** Setup to load initial values and initialize the state */
  public setup(name: string, state: StateAdapter, source: DataAdapterBase): this {
    const l = this.log.fnIfInList('setup', 'fields', name, { name, state, source });
    this.name = name;
    this.state = state;
    this.source = source;
    this.ready.set(true);
    // 1. Init Prefetch - for Entity Picker
    // This will place the prefetch items into the available-items list
    // Otherwise related entities would only show as GUIDs.
    const initiallySelected = state.selectedItems();
    l.a('setup', { initiallySelected })
    source.initPrefetch(initiallySelected.map(item => item.value));
    return l.rSilent(this);
  }

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

  /**
   * Inform the system that the sources are ready.
   * WIP experimenting with making it public, so that formulas can delay running dependant function.
   */
  ready = signalObj('sourceIsReady', false);

  /** Options to show in the picker. Can also show hints if something is wrong. Must be initialized at setup */
  public optionsRaw = computedObj('optionsSource', () => (this.ready() ? this.source.optionsOrHints() : null) ?? []);
  
  /** Overrides / replacements from formulas */
  public optionsOverride = signalObj<PickerItem[]>('overrideOptions', null);

  /** Final Options to show in the picker and to use to calculate labels of selected etc. */
  public optionsAll = computedObj('optionsFinal', () => getWith(this.optionsOverride(), o => o ? o : this.optionsRaw()));

  //#endregion

  //#region Selected Data

  /** Currently selected items. Must watch for ready. */
  public selectedRaw = computedObj<PickerItem[]>('selectedState', () => {
    const l = this.log.fnIfInList('selectedRaw', 'fields', this.name);
    return !this.ready()
      ? l.r([], 'not ready')
      : l.r(this.#toSelectedWithUiInfo(this.state.selectedItems(), this.optionsAll()), 'ready');
  });

  /** Overrides / replacements from formulas */
  public selectedOverride = signalObj<PickerItem[]>('selectedOverride', null);

  /** Currently selected items from override or raw */
  public selectedAll = computedObj('selectedAll', () => getWith(this.selectedOverride(), o => o ? o : this.selectedRaw()));

  /** First selected item */
  public selectedOne = computedObj('selectedOne', () => this.selectedAll()[0] ?? null);

  /** Create a copy of the selected items, so that any changes (in formulas) won't affect the real selected data */
  public selectedCopy(original: PickerItem[]): PickerItem[] {
    return original.map(item => ({ ...item }));
  }

  //#endregion

  //#region Options containing missing selected

  public optionsWithMissing = computedObj('optionsWithMissing', () => {
    const l = this.log.fnIf('optionsWithMissing');
    const selected = this.selectedAll();
    const options = this.optionsAll();
    const missing = selected.filter(s => !options.find(o => o.value === s.value));
    if (missing.length === 0) return options;

    const result = options.concat(missing);
    return l.r(result);
  });

  //#endregion

  /** Signal containing the features of the picker, basically to accumulate features such as "canEdit" */
  public features = computedObj('features', () => PickerFeatures.merge(this.source.features(), this.state.features()));


  public addNewlyCreatedItem(result: Record<string, number>) {
    const newItemGuid = Object.keys(result)[0];
    const l = this.log.fn('addNewlyCreatedItem', { result, newItemGuid });
    if (!this.state.values().includes(newItemGuid)) {
      this.state.add(newItemGuid);
      this.source.forceReloadData([newItemGuid]);
    }
    l.end();
  }

  #toSelectedWithUiInfo(selected: PickerItem[], opts: PickerItem[]): PickerItem[] {
    const l = this.log.fnIfInList('addInfosFromSourceForUi', 'fields', this.name, { selected, opts });
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
        info: original.info || null,
        link: original.link || null,
        noEdit: original.noEdit === true,
        noDelete: original.noDelete === true,
        noSelect: false,
      } satisfies PickerItem;
    });
    return l.r(result);
  }
}
