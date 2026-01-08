import { effect, inject, Injectable, Signal } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { getWith } from '../../../../../../core';
import { FieldSettings } from '../../../../../../edit-types/src/FieldSettings';
import { FieldSettingsPickerMerged } from '../../../../../../edit-types/src/FieldSettings-Pickers';
import { classLog } from '../../../shared/logging';
import { computedObj, signalObj } from '../../../shared/signals/signal.utilities';
import { DebugFields } from '../../edit-debug';
import { DataAdapterBase } from './adapters/data-adapter-base';
import { DataAdapterCanRefresh } from './adapters/data-adapter-can-refresh';
import { DataAdapterEntityBase } from './adapters/data-adapter-entity-base';
import { StateAdapter } from "./adapters/state-adapter";
import { PickerItem } from './models/picker-item.model';
import { mergePickerFeatures, PickerFeatures, PickerFeaturesForControl } from './picker-features.model';
import { pickerItemsAllowsEmpty } from './picker.helpers';

const logSpecs = {
  all: false,
  setup: false,
  addInfosFromSourceForUi: false,
  optionsWithMissing: false,
  selectedRaw: false,
  selectedOverride: false,
  selectedState: false,
  features: true,
  allOptions: false,
  fields: [...DebugFields, '*'],
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

  constructor() {
    // Log the options when they change (if enabled)
    if (this.log.enabled && this.log.specs.allOptions) {
      effect(() => {
        const ready = this.ready();
        const raw = this.optionsRaw();
        const override = this.optionsOverride();
        const final = this.optionsAll();
        this.log.a('options', { ready, raw, override, final });
      });
    }
  }

  /** Setup to load initial values and initialize the state */
  public setup(name: string, settings: Signal<FieldSettings>, state: StateAdapter, source: DataAdapterBase) {
    const l = this.log.fnIfInFields('setup', this.name, { name, state, source });

    // Setup this object
    this.name = name;
    this.#settingsLazy.set(settings as Signal<FieldSettings & FieldSettingsPickerMerged>);
    this.state = state;
    this.source = source;

    // Setup the State so it is able to do it's work based on data it wouldn't have otherwise
    state.features = this.features;
    state.allowsEmptyLazy.set(this.optionsAllowsEmpty);

    // 1. Init Prefetch - for Entity Picker
    // This will place the prefetch items into the available-items list
    // Otherwise related entities would only show as GUIDs.
    const values = state.values();
    l.a('setup', { initiallySelected: values });
    (source as DataAdapterBase & DataAdapterCanRefresh)?.initPrefetch?.(values);

    // When everything is done, mark as ready
    this.ready.set(true);

    l.end('done');
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
  public ready = signalObj('sourceIsReady', false);

  /** Options to show in the picker. Can also show hints if something is wrong. Must be initialized at setup */
  public optionsRaw = computedObj('optionsSource', () => (this.ready() ? this.source.optionsOrHints() : null) ?? []);
  
  /** Overrides / replacements from formulas */
  public optionsOverride = signalObj<PickerItem[]>('overrideOptions', null);

  /** Final Options to show in the picker and to use to calculate labels of selected etc. */
  public optionsAll = computedObj('optionsFinal', () => getWith(this.optionsOverride(), o => o ? o : this.optionsRaw()));

  /** Special information for string pickers which allow empty to be valid selection - also used in validator */
  public optionsAllowsEmpty = computedObj('optionsAllowsEmpty', () => pickerItemsAllowsEmpty(this.optionsAll()));

  //#endregion

  //#region Selected Data

  /** Currently selected items. Must watch for ready. */
  public selectedRaw = computedObj<PickerItem[]>('selectedState', () => {
    const l = this.log.fnIfInFields('selectedRaw', this.name);
    return !this.ready()
      ? l.r([], 'not ready')
      : l.r(this.#toSelectedWithUiInfo(this.state.selectedItems(), this.optionsAll()), 'ready');
  });

  /** Overrides / replacements from formulas */
  public selectedOverride = signalObj<PickerItem[]>('selectedOverride', null);

  /** Currently selected items from override or raw */
  public selectedAll = computedObj('selectedAll', () => getWith(this.selectedOverride(), o => o ? o : this.selectedRaw()));

  /** First selected item or null */
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

  #settingsLazy = signalObj<Signal<FieldSettings & FieldSettingsPickerMerged>>('settingsLazy', null);

  #featuresFromSettings = computedObj<PickerFeatures>('featuresFromSettings', () => {
    const s = this.#settingsLazy()();
    return {
      textEntry: s.EnableTextEntry,
      multiValue: s.AllowMultiValue,
      create: s.EnableCreate && !!s.CreateTypes,
      remove: s.EnableRemove,
      delete: s.EnableDelete,
      edit: s.EnableEdit,       // note: added in 19.03.02, seems to have been forgotten before?
    } satisfies PickerFeatures;
  });

  /** Signal containing the features of the picker, basically to accumulate features such as "canEdit" */
  public features = computedObj<PickerFeaturesForControl>('features', () => {
    const sourceFeatures = this.source.myFeatures();
    const stateFeatures = this.state.myFeatures();
    const settingsFeatures = this.#featuresFromSettings();
    
    const mergeSourceAndState = mergePickerFeatures(sourceFeatures, stateFeatures);
    const mergeSettings = mergePickerFeatures(mergeSourceAndState, settingsFeatures);
    const forControl = {
      ...mergeSettings,
      showGoToListDialogButton: mergeSettings.multiValue,
      showAddNewButton: mergeSettings.create,
    } satisfies PickerFeaturesForControl;

    this.log.aIf('features', { sourceFeatures, stateFeatures, settingsFeatures, mergeSourceAndState, mergeSettings, forControl });
    return forControl;
  });

  public addNewlyCreatedItem(result: Record<string, number>) {
    const newItemGuid = Object.keys(result)[0];
    const l = this.log.fn('addNewlyCreatedItem', { result, newItemGuid });
    if (!this.state.values().includes(newItemGuid)) {
      this.state.add(newItemGuid);
      (this.source as DataAdapterBase & DataAdapterCanRefresh)?.forceReloadData?.([newItemGuid]);
    }
    l.end();
  }

  #toSelectedWithUiInfo(selected: string[], opts: PickerItem[]): PickerItem[] {
    const l = this.log.fnIfInFields('addInfosFromSourceForUi', this.name, { selected, opts });

    const result = selected.map(item => {
      // If the selected item is not in the data, show the raw / original item
      const original = opts.find(e => e.value === item);

      return original
        // Since we seem to have more information from the source, use that
        ? createPickerItemFromItem(original, original.label ?? this.#translate.instant('Fields.Picker.EntityNotFound'))
        // If it's not in the data, just show the value
        : this.#createPickerItemFromValue(item);
    });
    return l.r(result);
  }

  //#region Text Mode

  public isInFreeTextMode = signalObj('isInFreeTextMode', false);

  toggleFreeTextMode(): void {
    this.isInFreeTextMode.update(p => !p);
  }

  //#endregion

  #createPickerItemFromValue(value: string): PickerItem {
    value = value?.toString() ?? '';  // safe to-string, so it's never 'undefined'

    const validDataExpected = this.source instanceof DataAdapterEntityBase;

    return {
      // Special: if e.g. string with free text value which is not found, disable edit and delete.
      // Otherwise we may see an edit-pencil for a value that is not in the dropdown (eg. a system query)
      noEdit: true,
      noDelete: true,
      // either the real value or null if text-field or not found
      id: null,
      label: value + (validDataExpected ? ' ⚠️': ''),
      tooltip: value + (validDataExpected ? ` ⚠️ ${this.#translate.instant('Fields.Picker.EntityNotFound')} - could result in error` : ' (manual entry)'),
      value,
    } satisfies PickerItem;
  }
}

//#region Helper Functions for PickerItem



function createPickerItemFromItem(original: PickerItem, label: string) {
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
}

//#endregion