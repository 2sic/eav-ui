import { PickerItem } from './models/picker-item.model';
import { StateAdapter } from "./adapters/state-adapter";
import { TranslateService } from '@ngx-translate/core';
import { Injectable, Signal, inject } from '@angular/core';
import { PickerFeatures } from './picker-features.model';
import { DataAdapterBase } from './adapters/data-adapter-base';
import { computedObj } from '../../../shared/signals/signal.utilities';
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

  constructor() { }

  #translate = inject(TranslateService);
  
  //#endregion

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

  /** Options to show in the picker. Can also show hints if something is wrong. Must be initialized at setup */
  public pickerOptions = computedObj('pickerOptions', () => this.source?.optionsOrHints() ?? []);

  /** Temp info if it was already initialized, can probably be removed once we have the PickerDataFactory complete */
  public get isInitialized(): boolean {
    return !!this.source && !!this.state;
  }

  public closeWatcherAttachedWIP = false;

  /** Signal containing the currently selected items */
  public selectedAll = computedObj('selectedAll', () => this.#createUIModel(this.state.selectedItems(), this.source.optionsOrHints()));

  /** Signal containing the first selected item */
  public selectedOne = computedObj('selectedOne', () => this.selectedAll()[0] ?? null);

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
    this.pickerOptions = source.optionsOrHints;
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
    if (!this.state.createValueArray().includes(newItemGuid)) {
      this.state.addSelected(newItemGuid);
      this.source.forceReloadData([newItemGuid]);
    }
    l.end();
  }

  #createUIModel(selected: PickerItem[], data: PickerItem[]): PickerItem[] {
    const result = selected.map(item => {
      // If the selected item is not in the data, show the raw / original item
      const entity = data.find(e => e.value === item.value);
      if (!entity)
        return item;
      
      // Since we seem to have more information from the source, use that
      const text = entity.label ?? this.#translate.instant('Fields.Picker.EntityNotFound');
      return {
        id: entity.id,
        value: entity.value,
        label: text,
        tooltip: entity.tooltip || `${text} (${entity.value})`,
        infoBox: entity.infoBox || '',
        noEdit: entity.noEdit === true,
        noDelete: entity.noDelete === true,
        notSelectable: false,
      } satisfies PickerItem;
    });
    return result;
  }
}
