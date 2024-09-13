import { ReorderIndexes } from '../picker-list/reorder-index.models';
import { convertArrayToString, convertValueToArray, correctStringEmptyValue } from '../picker.helpers';
import { DeleteEntityProps } from '../models/picker.models';
import { moveItemInArray } from '@angular/cdk/drag-drop';
import { Injectable, Optional, inject } from '@angular/core';
import { PickerFeatures } from '../picker-features.model';
import { FieldState } from '../../field-state';
import { FormConfigService } from '../../../form/form-config.service';
import { signalObj, computedObj } from '../../../../shared/signals/signal.utilities';
import { classLog, ClassLogger } from '../../../../shared/logging';

@Injectable()
export class StateAdapter {
  
  log: ClassLogger

  public formConfigSvc = inject(FormConfigService);
  #fieldState = inject(FieldState) as FieldState<string | string[]>;
  #settings = this.#fieldState.settings;

  constructor(@Optional() logger?: ClassLogger) {
    this.log = logger ?? classLog({StateAdapter});
  }

  public isInFreeTextMode = signalObj('isInFreeTextMode', false);

  public features = signalObj('features', {} as Partial<PickerFeatures>);

  /**  List of entity types to create for the (+) button; ATM exclusively used in the new pickers for selecting the source. */
  public createEntityTypes = computedObj('createEntityTypes', () => {
    const types = this.#settings().CreateTypes;
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

  protected readonly settings = this.#fieldState.settings;

  #sepAndOpts = computedObj('sepAndOpts', () => {
    const settings = this.#settings();
    return { separator: settings.Separator, options: settings._options };
  });

  public selectedItems = computedObj('selectedItems', () => {
    const sAndO = this.#sepAndOpts();
    return correctStringEmptyValue(this.#fieldState.uiValue(), sAndO.separator, sAndO.options);
  });

  #focusOnSearchComponent: () => void;

  public linkLog(log: ClassLogger): this {
    if (!this.log.enabled)
      this.log.inherit(log);
    return this;
  };

  public attachCallback(focusCallback: () => void): this {
    this.log.a('attachCallback');
    this.#focusOnSearchComponent = focusCallback;
    return this;
  }

  #updateValue(value: string | number | ReorderIndexes, operation: (original: string[]) => string[]): void {
    const l = this.log.fn('updateValue', { value });
    const valueArray: string[] = this.asArray();
    const modified = operation(valueArray);
    const newValue = this.asFieldValue(modified);
    this.#fieldState.ui().set(newValue);
  }

  protected asFieldValue(valueArray: string[]): string | string[] {
    return typeof this.#fieldState.uiValue() === 'string'
      ? convertArrayToString(valueArray, this.#settings().Separator)
      : valueArray;
  }

  public asArray(): string[] {
    const value = this.#fieldState.uiValue();
    return (typeof value === 'string')
      ? convertValueToArray(value, this.#settings().Separator)
      : [...value];
  }

  
  public add(value: string) {
    this.#updateValue(value, list => (this.#settings().AllowMultiValue) ? [...list, value] : [value]);
  }

  public reorder(reorderIndexes: ReorderIndexes) {
    this.#updateValue(reorderIndexes, list => {
      moveItemInArray(list, reorderIndexes.previousIndex, reorderIndexes.currentIndex);
      return list;
    });
  }

  public remove(index: number) {
    this.#updateValue(index, list => {
      list.splice(index, 1);
      return list;
    });

    if (!this.asArray().length) {
      // move back to component
      setTimeout(() => {
        console.log('trying to call focus');
        this.#focusOnSearchComponent();
      });
    }
  }

  public doAfterDelete(props: DeleteEntityProps) { this.remove(props.index); }

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
// if (dumpProperties) {
//   this.shouldPickerListBeShown$.subscribe(shouldShow => this.log.add(`shouldPickerListBeShown ${shouldShow}`));
// }


// // signal
// this.subscriptions.add(
//   selectedItems$.subscribe(this.selectedItems.set)
// );
