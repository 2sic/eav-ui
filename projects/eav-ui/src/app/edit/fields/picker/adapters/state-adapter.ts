import { moveItemInArray } from '@angular/cdk/drag-drop';
import { Injectable, Signal, inject } from '@angular/core';
import { getWith } from '../../../../../../../core';
import { FieldSettings } from '../../../../../../../edit-types/src/FieldSettings';
import { FieldSettingsOptionsWip, FieldSettingsPickerMerged } from '../../../../../../../edit-types/src/FieldSettings-Pickers';
import { classLog } from '../../../../shared/logging';
import { computedObj, signalObj } from '../../../../shared/signals/signal.utilities';
import { DebugFields } from '../../../edit-debug';
import { FormConfigService } from '../../../form/form-config.service';
import { FieldState } from '../../field-state';
import { DeleteEntityProps } from '../models/picker.models';
import { PickerFeatures } from '../picker-features.model';
import { ReorderIndexes } from '../picker-list/reorder-index.models';
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
  typesForNew: false,
  correctStringEmptyValue: true,
  fields: [...DebugFields, 'Query'],
};

@Injectable()
export class StateAdapter {

  //#region Setup / Inject / Logs

  log = classLog({StateAdapter}, logSpecsStateAdapter);

  #formConfigSvc = inject(FormConfigService);
  #fieldState = inject(FieldState) as FieldState<number | string | string[], FieldSettings & FieldSettingsOptionsWip & FieldSettingsPickerMerged>;

  constructor() { }

  public setup(fieldName: string, uiMapper: StateUiMapperBase): this {
    this.#fieldName = fieldName;
    this.mapper = uiMapper as StateUiMapperBase<number | string | string[], string[]>;
    return this;
  }

  /**
   * Mapper to convert between the state and the UI - must be configured in setup.
   * On the UI side, must always be an array of strings.
   */
  public mapper: StateUiMapperBase<number | string | string[], string[]>;

  /** Field Name - just for selective debugging */
  #fieldName: string;

  //#endregion

  protected readonly settings = this.#fieldState.settings;

  /** The features this source will broadcast, to be merged with other features */
  public myFeatures = signalObj('features', {} as Partial<PickerFeatures>);

  /** The final valid features, must be provided by the picker-data */
  public features: Signal<PickerFeatures>;


  #createTypesRaw = computedObj('createTypesRaw',
    () => getWith(this.settings().CreateTypes,
      ts => ts.split(ts.indexOf('\n') > -1 ? '\n' : ',')).filter(Boolean));

  /**  List of entity types to create for the (+) button; ATM exclusively used in the new pickers for selecting the source. */
  public typesForNew = computedObj('typesForNew', () => {
    const raw = this.#createTypesRaw().map((guid: string) => ({ label: null as string, guid }));
    
    const l = this.log.fnIfInList('typesForNew', 'fields', this.#fieldName, { raw });

    // return [];
    // Augment with additional label and guid if we have this
    const updated = raw.map(orig => {
      const guid = orig.guid;
      const ct = this.#formConfigSvc.settings.ContentTypes
        .find(ct => ct.Id === guid || ct.Name == guid);
      return {
        ...orig,
        // replace is a bit temporary, as the names are a bit long...
        label: (ct?.Title ?? ct?.Name ?? `${guid} (not found)`).replace('UI Picker Source - ', ''),
        guid: ct?.Id ?? guid,
      }
    });
    return l.r(updated);
  });

  /**
   * Lazy Signal telling us if empty values are allowed
   * Should ONLY be used in 'selectedItems' - and never in Values, as we would create a loop
   * since the this will also access the possible options, which in turn is initialized using the selectedItems
   */
  public allowsEmptyLazy = signalObj<Signal<boolean>>('allowsEmptyLazy', signalObj('initial', false));

  /**
   * Signal with all the currently selected items.
   * The PickerItems are fairly basic, as any additional data is added later on.
   * The only case the additional data matters,
   * is when we have a string-picker with a free-text value that is not in the dropdown.
   * In that case, additional data from here is used to disable edit and delete.
   */
  public selectedItems: Signal<string[]> = computedObj('selectedItems', () => {
    const uiValue = this.#fieldState.uiValue();
    this.log.fnIf('selectedItems', { uiValue });
    const asUi = this.mapper.toUi(uiValue);
    const pickerAllowsEmpty = this.allowsEmptyLazy()();
    const uiFixed = asUi.length == 0 && pickerAllowsEmpty
      ? ['']
      : asUi;
    return uiFixed;
  });

  //#region Callbacks for setting the focus, like after removing the last selection

  #focusOnSearchComponent: () => void;

  public attachCallback(focusCallback: () => void): this {
    const l = this.log.fnIf('attachCallback');
    this.#focusOnSearchComponent = focusCallback;
    return l.rSilent(this);
  }

  //#endregion

  //#region Conversion back and forth between formats

  /** Signal with the current values in the picker, as an array */
  public values = computedObj('values', () => {
    const asUi = this.mapper.toUi(this.#fieldState.uiValue());
    return asUi;
  });

  //#endregion

  //#region CRUD operations

  #updateValue(operation: (original: string[]) => string[]): void {
    const l = this.log.fnIfInList('updateValue', 'fields', this.#fieldName);
    // Get original data, and make sure we have a copy, so that ongoing changes won't affect the original
    // If we don't do this, then later change detection can fail!
    const valueArray = [...this.values()];
    const modified = operation(valueArray);
    const newValue = this.mapper.toState(modified);
    this.#fieldState.ui().setIfChanged(newValue);
    l.end('', { newValue });
  }

  public add(value: string): void {
    this.log.fnIfInList('add', 'fields', this.#fieldName, { value });
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

}
