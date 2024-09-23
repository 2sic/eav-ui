import { ReorderIndexes } from '../picker-list/reorder-index.models';
import { correctStringEmptyValue } from '../picker.helpers';
import { DeleteEntityProps } from '../models/picker.models';
import { moveItemInArray } from '@angular/cdk/drag-drop';
import { Injectable, inject } from '@angular/core';
import { PickerFeatures } from '../picker-features.model';
import { FieldState } from '../../field-state';
import { FormConfigService } from '../../../form/form-config.service';
import { signalObj, computedObj } from '../../../../shared/signals/signal.utilities';
import { classLog } from '../../../../shared/logging';
import { StateUiMapperBase } from './state-ui-mapper-base';

export const logSpecsStateAdapter = {
  all: false,
  updateValue: true,
  add: false,
  set: true,
  remove: true,
  reorder: true,
  doAfterDelete: true,
  selectedItems: true,
  sepAndOpts: true,
  createEntityTypes: true,
  attachCallback: true,
};

@Injectable()
export abstract class StateAdapter {
  
  //#region Setup / Inject / Logs

  log = classLog({StateAdapter}, logSpecsStateAdapter, false);
  
  public formConfigSvc = inject(FormConfigService);
  #fieldState = inject(FieldState) as FieldState<string | string[]>;

  constructor() { }

  //#endregion

  protected readonly settings = this.#fieldState.settings;

  public isInFreeTextMode = signalObj('isInFreeTextMode', false);

  public features = signalObj('features', {} as Partial<PickerFeatures>);

  /**  List of entity types to create for the (+) button; ATM exclusively used in the new pickers for selecting the source. */
  public typesForNew = computedObj('createEntityTypes', () => {
    const types = this.settings().CreateTypes;
    // Get / split the types from the configuration
    const raw = types
      ? types
        .split(types.indexOf('\n') > -1 ? '\n' : ',')   // use either \n or , as delimiter
        .map((guid: string) => ({ label: null, guid }))
      : []
    // Augment with additional label and guid if we have this
    const updated = raw.map(orig => {
      const guid = orig.guid;
      const ct = this.formConfigSvc.settings.ContentTypes
        .find(ct => ct.Id === guid || ct.Name == guid);
      return {
        ...orig,
        label: ct?.Name ?? guid + " (not found)",
        guid: ct?.Id ?? guid,
      }
    });
    return updated;
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

      return correctStringEmptyValue(uiValue, sAndO.separator, sAndO.options);
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
  public abstract mapper: StateUiMapperBase<string | string[], string[]>;

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
    this.#fieldState.ui().set(newValue);
    l.end('', { newValue });
  }
  
  public add(value: string): void {
    this.log.fnIf('add', { value });
    this.#updateValue(list => (this.settings().AllowMultiValue) ? [...list, value] : [value]);
  }

  public set(values: string[]): void {
    this.log.fnIf('set', { values });
    this.#updateValue(() => values);
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

    if (!this.values().length) {
      // move back to component
      setTimeout(() => {
        console.log('trying to call focus');
        this.#focusOnSearchComponent();
      });
    }
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

// 2024-06-20 Keep in case we need it later

// Temp centralize logic if pickerList should show, but not in use yet.
// Commented out, till we need it, then refactor to signals
// var allowMultiValue$ = this.settings$.pipe(mapUntilChanged(settings => settings.AllowMultiValue));
// this.shouldPickerListBeShown$ = combineLatest([
//   this.isExpanded$,
//   allowMultiValue$,
//   selectedItems$,
// ]).pipe(
//   map(([isExpanded, allowMultiValue, selectedItems]) => {
//     return !this.isInFreeTextMode()
//       && ((selectedItems.length > 0 && allowMultiValue) || (selectedItems.length > 1 && !allowMultiValue))
//       && (!allowMultiValue || (allowMultiValue && isExpanded));
//   })
// );
