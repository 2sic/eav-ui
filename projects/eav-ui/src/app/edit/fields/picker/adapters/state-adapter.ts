import { moveItemInArray } from '@angular/cdk/drag-drop';
import { Injectable, Signal, inject } from '@angular/core';
import { getWith } from '../../../../../../../core';
import { FieldSettings } from '../../../../../../../edit-types/src/FieldSettings';
import { FieldSettingsPickerMerged } from '../../../../../../../edit-types/src/FieldSettings-Pickers';
import { classLog } from '../../../../shared/logging';
import { computedObj, signalObj } from '../../../../shared/signals/signal.utilities';
import { FormConfigService } from '../../../form/form-config.service';
import { FieldState } from '../../field-state';
import { DeleteEntityProps } from '../models/picker.models';
import { PickerFeatures } from '../picker-features.model';
import { ReorderIndexes } from '../picker-list/reorder-index.models';
import { correctStringEmptyValue } from '../picker.helpers';
import { StateUiMapperBase } from './state-ui-mapper-base';

export const logSpecsStateAdapter = {
  all: false,
  updateValue: false,
  add: false,
  set: false,
  remove: false,
  reorder: false,
  doAfterDelete: false,
  selectedItems: false,
  sepAndOpts: false,
  createEntityTypes: false,
  attachCallback: false,
  typesForNew: true,
};

@Injectable()
export abstract class StateAdapter {

  //#region Setup / Inject / Logs

  log = classLog({StateAdapter}, logSpecsStateAdapter);

  #formConfigSvc = inject(FormConfigService);
  #fieldState = inject(FieldState) as FieldState<number | string | string[], FieldSettings & FieldSettingsPickerMerged>;

  constructor() { }

  //#endregion

  protected readonly settings = this.#fieldState.settings;

  public isInFreeTextMode = signalObj('isInFreeTextMode', false);

  /** The features this source will broadcast, to be merged with other features */
  public myFeatures = signalObj('features', {} as Partial<PickerFeatures>);

  /** The final valid features, must be provided by the picker-data */
  public features: Signal<PickerFeatures>;


  #createTypesRaw = computedObj('createTypesRaw',
    () => getWith(this.settings().CreateTypes,
      ts => ts.split(ts.indexOf('\n') > -1 ? '\n' : ',')).filter(Boolean));

  /**  List of entity types to create for the (+) button; ATM exclusively used in the new pickers for selecting the source. */
  public typesForNew = computedObj('typesForNew', () => {
    const raw = this.#createTypesRaw().map((guid: string) => ({ label: null, guid }));
    
    const l = this.log.fnIf('typesForNew', { raw });

    // return [];
    // Augment with additional label and guid if we have this
    const updated = raw.map(orig => {
      const guid = orig.guid;
      const ct = this.#formConfigSvc.settings.ContentTypes
        .find(ct => ct.Id === guid || ct.Name == guid);
      return {
        ...orig,
        // replace is a bit temporary, as the names are a bit long...
        label: (ct?.Title ?? ct?.Name ?? guid + " (not found)").replace('UI Picker Source - ', ''),
        guid: ct?.Id ?? guid,
      }
    });
    return l.r(updated);
  });

  /** Signal with all the currently selected items */
  public selectedItems = (() => {
    // Computed just to debounce changes on separator and options from field-settings (old picker)
    const sepAndOpts = computedObj('sepAndOpts', () => {
      const { Separator, _options } = this.settings();
      return { separator: Separator, options: _options };
    });

    // Find selected items and correct empty value (if there is an empty-string options)
    const l = this.log.fnIf('selectedItems');
    return computedObj('selectedItems', () => {
      const sAndO = sepAndOpts();
      const uiValue = this.#fieldState.uiValue();
      l.a('selectedItems', { uiValue, sAndO });

      return correctStringEmptyValue(this.mapper.toUi(uiValue), sAndO.options);
    });
  })();

  //#region Callbacks for setting the focus - TODO: not sure if it works ATM

  #focusOnSearchComponent: () => void;

  public attachCallback(focusCallback: () => void): this {
    this.log.a('attachCallback');
    this.#focusOnSearchComponent = focusCallback;
    return this;
  }

  //#endregion

  //#region Conversion back and forth between formats

  /**
   * Mapper to convert between the state and the UI - must be added by inheriting class.
   * On the UI side, must always be an array of strings.
   */
  public abstract mapper: StateUiMapperBase<number | string | string[], string[]>;

  /** Signal with the current values in the picker, as an array */
  public values = computedObj('ids', () => this.mapper.toUi(this.#fieldState.uiValue()));

  //#endregion

  //#region CRUD operations

  #updateValue(operation: (original: string[]) => string[]): void {
    const l = this.log.fnIf('updateValue');
    // Get original data, and make sure we have a copy, so that ongoing changes won't affect the original
    // If we don't do this, then later change detection can fail!
    const valueArray = [...this.values()];
    const modified = operation(valueArray);
    const newValue = this.mapper.toState(modified);
    this.#fieldState.ui().setIfChanged(newValue);
    l.end('', { newValue });
  }

  public add(value: string): void {
    this.log.fnIf('add', { value });
    this.#updateValue(list => (this.features().multiValue) ? [...list, value] : [value]);
  }

  public set(values: string[]): void {
    this.log.fnIf('set', { values });
    this.#updateValue(() => values);
  }

  public flush(): void {
    this.set([]);
  }

  public reorder(reorderIndexes: ReorderIndexes) {
    this.log.fnIf('reorder', { reorderIndexes });
    this.#updateValue(list => {
      moveItemInArray(list, reorderIndexes.previousIndex, reorderIndexes.currentIndex);
      return [...list];
    });
  }

  public remove(index: number) {
    this.log.fnIf('remove', { index });
    this.#updateValue(list => {
      list.splice(index, 1);
      return [...list];
    });

    // If we have no items left, set focus back to the search component, since this is usually wanted
    if (!this.values().length)
      setTimeout(() => this.#focusOnSearchComponent());
  }

  public doAfterDelete(props: DeleteEntityProps) {
    this.log.fnIf('doAfterDelete', { props });
    this.remove(props.index);
  }

  //#endregion

  toggleFreeTextMode(): void {
    this.isInFreeTextMode.update(p => !p);
  }
}
