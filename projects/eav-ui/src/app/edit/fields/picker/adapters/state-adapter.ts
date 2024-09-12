import { ReorderIndexes } from '../picker-list/reorder-index.models';
import { convertArrayToString, convertValueToArray, correctStringEmptyValue } from '../picker.helpers';
import { DeleteEntityProps } from '../models/picker.models';
import { moveItemInArray } from '@angular/cdk/drag-drop';
import { Injectable, Optional, inject } from '@angular/core';
import { PickerFeatures } from '../picker-features.model';
import { FieldState } from '../../field-state';
import { ControlHelpers } from '../../../shared/controls/control.helpers';
import { EavLogger } from '../../../../shared/logging/eav-logger';
import { FormConfigService } from '../../../form/form-config.service';
import { signalObj, computedObj } from '../../../../shared/signals/signal.utilities';

const logSpecs = {
  enabled: false,
  name: 'StateAdapter',
};

@Injectable()
export class StateAdapter {
  
  log: EavLogger

  public formConfigSvc = inject(FormConfigService);
  private fieldState = inject(FieldState) as FieldState<string | string[]>;

  constructor(@Optional() logger: EavLogger = null) {
    this.log = logger ?? new EavLogger(logSpecs);
  }

  public isInFreeTextMode = signalObj('isInFreeTextMode', false);

  public features = signalObj('features', {} as Partial<PickerFeatures>);

  /**  List of entity types to create for the (+) button; ATM exclusively used in the new pickers for selecting the source. */
  public createEntityTypes = computedObj('createEntityTypes', () => {
    const types = this.fieldState.settings().CreateTypes;
    return types
      ? types
        .split(types.indexOf('\n') > -1 ? '\n' : ',')   // use either \n or , as delimiter
        .map((guid: string) => ({ label: null, guid }))
      : []
  });

  protected readonly settings = this.fieldState.settings;
  public controlStatus = this.fieldState.controlStatus;
  public basics = this.fieldState.basics;


  #value = computedObj('value', () => this.controlStatus().value);
  #sepAndOpts = computedObj('sepAndOpts', () => {
    const settings = this.fieldState.settings();
    return { separator: settings.Separator, options: settings._options };
  });

  public selectedItems = computedObj('selectedItems', () => {
    const sAndO = this.#sepAndOpts();
    return correctStringEmptyValue(this.#value(), sAndO.separator, sAndO.options);
  });

  #focusOnSearchComponent: () => void;

  public linkLog(log: EavLogger): this {
    if (!this.log.enabled)
      this.log.inherit(log);
    return this;
  };

  public attachCallback(focusCallback: () => void): this {
    this.log.a('attachCallback');
    this.#focusOnSearchComponent = focusCallback;
    return this;
  }

  #updateValue(action: 'add' | 'delete' | 'reorder', value: string | number | ReorderIndexes): void {
    const l = this.log.fn('updateValue', { action, value });
    let valueArray: string[] = this.createValueArray();

    switch (action) {
      case 'add':
        const guid = value as string;
        if (this.fieldState.settings().AllowMultiValue)
          valueArray.push(guid);
        else
          valueArray = [guid];
        break;
      case 'delete':
        const index = value as number;
        valueArray.splice(index, 1);
        break;
      case 'reorder':
        const reorderIndexes = value as ReorderIndexes;
        moveItemInArray(valueArray, reorderIndexes.previousIndex, reorderIndexes.currentIndex);
        break;
    }

    const newValue = this.createNewValue(valueArray);
    ControlHelpers.patchControlValue(this.fieldState.control, newValue);

    if (action === 'delete' && !valueArray.length) {
      // move back to component
      setTimeout(() => {
        console.log('trying to call focus');
        this.#focusOnSearchComponent();
      });
    }
  }

  protected createNewValue(valueArray: string[]): string | string[] {
    return typeof this.fieldState.control.value === 'string'
      ? convertArrayToString(valueArray, this.fieldState.settings().Separator)
      : valueArray;
  }

  public createValueArray(): string[] {
    const fs = this.fieldState;
    if (typeof fs.control.value === 'string')
      return convertValueToArray(fs.control.value, fs.settings().Separator);
    return [...fs.control.value];
  }

  public doAfterDelete(props: DeleteEntityProps) {
    this.#updateValue('delete', props.index);
  }

  addSelected(guid: string) { this.#updateValue('add', guid); }
  removeSelected(index: number) { this.#updateValue('delete', index); }
  reorder(reorderIndexes: ReorderIndexes) { this.#updateValue('reorder', reorderIndexes); }

  toggleFreeTextMode(): void {
    this.isInFreeTextMode.update(p => !p);
  }

  getEntityTypesData(): void {
    if (this.createEntityTypes()[0].label) return;
    this.createEntityTypes().forEach(entityType => {
      const ct = this.formConfigSvc.settings.ContentTypes
        .find(ct => ct.Id === entityType.guid || ct.Name == entityType.guid);
      entityType.label = ct?.Name ?? entityType.guid + " (not found)";
      entityType.guid = ct?.Id ?? entityType.guid;
    });
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
