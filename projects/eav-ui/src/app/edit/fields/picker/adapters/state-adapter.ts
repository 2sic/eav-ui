import { moveItemInArray } from '@angular/cdk/drag-drop';
import { Injectable, Signal, inject } from '@angular/core';
import { getWith } from '../../../../../../../core';
import { PickerOptionCustom } from '../../../../../../../edit-types/src/DropdownOption';
import { FieldSettings } from '../../../../../../../edit-types/src/FieldSettings';
import { FieldSettingsOptionsWip, FieldSettingsPickerMerged } from '../../../../../../../edit-types/src/FieldSettings-Pickers';
import { classLog } from '../../../../shared/logging';
import { computedObj, signalObj } from '../../../../shared/signals/signal.utilities';
import { FormConfigService } from '../../../form/form-config.service';
import { FieldState } from '../../field-state';
import { PickerItem } from '../models/picker-item.model';
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
  typesForNew: true,
};

@Injectable()
export abstract class StateAdapter {

  //#region Setup / Inject / Logs

  log = classLog({StateAdapter}, logSpecsStateAdapter);

  #formConfigSvc = inject(FormConfigService);
  #fieldState = inject(FieldState) as FieldState<number | string | string[], FieldSettings & FieldSettingsOptionsWip & FieldSettingsPickerMerged>;

  constructor() { }

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

  /** Lazy Signal telling us if empty values are allowed */
  public allowsEmptyLazy = signalObj<Signal<boolean>>('allowsEmptyLazy', signalObj('initial', false));

  /**
   * Signal with all the currently selected items.
   * The PickerItems are fairly basic, as any additional data is added later on.
   */
  public selectedItems: Signal<PickerItem[]> = (() => {
    // Computed just to debounce changes on separator and options from field-settings (old picker)
    const options = this.#fieldState.settingExt('_options');

    // Find selected items and correct empty value (if there is an empty-string options)
    const l = this.log.fnIf('selectedItems');
    return computedObj('selectedItems', () => {
      const sAndO = options();
      const uiValue = this.#fieldState.uiValue();
      l.a('selectedItems', { uiValue, sAndO });
      const asUi = this.mapper.toUi(uiValue);
      const uiFixed = asUi.length == 0 && this.allowsEmptyLazy()()
        ? ['']
        : asUi;
      return this.correctStringEmptyValue(uiFixed, sAndO);
    });
  })();

  //#region Callbacks for setting the focus - TODO: not sure if it works ATM

  #focusOnSearchComponent: () => void;

  public attachCallback(focusCallback: () => void): this {
    const l = this.log.fnIf('attachCallback');
    this.#focusOnSearchComponent = focusCallback;
    return l.rSilent(this);
  }

  //#endregion

  //#region Conversion back and forth between formats

  /**
   * Mapper to convert between the state and the UI - must be added by inheriting class.
   * On the UI side, must always be an array of strings.
   */
  public abstract mapper: StateUiMapperBase<number | string | string[], string[]>;

  /** Signal with the current values in the picker, as an array */
  public values = computedObj('values', () => this.mapper.toUi(this.#fieldState.uiValue()));

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

  //#region String Empty Values
  correctStringEmptyValue(
    values: string[], // The value as an array of strings from state-adapter mapper
    dropdownOptions: PickerOptionCustom[] // Options are used only for legacy use case is where the value is an empty string
  ): PickerItem[] {

    const l = this.log.fn('correctStringEmptyValue', { valueAsArray: values, dropdownOptions });

    const result = values.map(value => {
      const option = dropdownOptions?.find(o => o.Value == value);
      return ({
        // 2024-10-21 2dm disabling this, don't think it has any effect
        // if it's a free text value or not found, disable edit and delete
        // noEdit: true,
        // noDelete: true,
        // either the real value or null if text-field or not found
        id: null,
        label: null,
        // label: option?.Title ?? value,
        // tooltip: `${value}`,
        value: value?.toString() ?? '', // safe to-string
      } satisfies PickerItem);
    });
    l.a('correctStringEmptyValue', {
      dropdownOptions,
      values,
      result,
    });
    return l.r(result);
  }
  //#endregion
}
