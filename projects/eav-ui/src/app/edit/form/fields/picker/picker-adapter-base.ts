import { moveItemInArray } from '@angular/cdk/drag-drop';
import { AbstractControl } from '@angular/forms';
import { FieldSettings } from 'projects/edit-types';
import { BehaviorSubject } from 'rxjs';
import { FieldMask, GeneralHelpers } from '../../../shared/helpers';
import { FieldConfigSet } from '../../builder/fields-builder/field-config-set.model';
import { ReorderIndexes } from './picker-list/picker-list.models';
import { PickerSearchComponent } from './picker-search/picker-search.component';
import { convertArrayToString, convertValueToArray } from './picker.helpers';

export class PickerAdapterBase {
  constructor() {
  }

  control: AbstractControl;
  config: FieldConfigSet;
  contentTypeMask?: FieldMask;

  entitySearchComponent: PickerSearchComponent;

  settings$: BehaviorSubject<FieldSettings> = new BehaviorSubject(null);
  disableAddNew$: BehaviorSubject<boolean> = new BehaviorSubject(true);

  destroy(): void {
    this.contentTypeMask?.destroy();
    this.disableAddNew$.complete();
  }

  updateAddNew(): void {
    const contentTypeName = this.contentTypeMask.resolve();
    this.disableAddNew$.next(!contentTypeName);
  }

  updateValue(action: 'add' | 'delete' | 'reorder', value: string | number | ReorderIndexes): void {
    const valueArray: string[] = (typeof this.control.value === 'string')
      ? convertValueToArray(this.control.value, this.settings$.value.Separator)
      : [...this.control.value];

    switch (action) {
      case 'add':
        const guid = value as string;
        valueArray.push(guid);
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

    const newValue = typeof this.control.value === 'string'
      ? convertArrayToString(valueArray, this.settings$.value.Separator)
      : valueArray;
    GeneralHelpers.patchControlValue(this.control, newValue);

    if (action === 'delete' && !valueArray.length) {
      setTimeout(() => {
        this.entitySearchComponent.autocompleteRef?.nativeElement.focus();
      });
    }
  }
}
