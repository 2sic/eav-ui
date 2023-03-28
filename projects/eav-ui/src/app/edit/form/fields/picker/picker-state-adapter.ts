import { moveItemInArray } from '@angular/cdk/drag-drop';
import { AbstractControl } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core/public_api';
import { EntityInfo, FieldSettings } from 'projects/edit-types';
import { BehaviorSubject, combineLatest, distinctUntilChanged, map, Observable } from 'rxjs';
import { GeneralHelpers } from '../../../shared/helpers';
import { ControlStatus } from '../../../shared/models';
import { FieldConfigSet } from '../../builder/fields-builder/field-config-set.model';
import { SelectedEntity } from '../entity/entity-default/entity-default.models';
import { QueryEntity } from '../entity/entity-query/entity-query.models';
import { ReorderIndexes } from './picker-list/picker-list.models';
import { PickerSearchComponent } from './picker-search/picker-search.component';
import { PickerSourceAdapter } from './picker-source-adapter';
import { calculateSelectedEntities, convertArrayToString, convertValueToArray } from './picker.helpers';

export class PickerStateAdapter {
  pickerSourceAdapter: PickerSourceAdapter;

  constructor() {
  }

  shouldPickerListBeShown$: Observable<boolean>;
  isExpanded$: Observable<boolean>;
  freeTextMode$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  settings$: BehaviorSubject<FieldSettings> = new BehaviorSubject(null);
  error$: BehaviorSubject<string> = new BehaviorSubject('');
  disableAddNew$: BehaviorSubject<boolean> = new BehaviorSubject(true);

  config: FieldConfigSet;
  control: AbstractControl;
  entitySearchComponent: PickerSearchComponent

  controlStatus$: BehaviorSubject<ControlStatus<string | string[]>>;

  selectedEntities$: Observable<SelectedEntity[]>;
  label$: Observable<string>;
  placeholder$: Observable<string>;
  required$: Observable<boolean>;

  allowMultiValue$: Observable<boolean>;
  cacheEntities$: Observable<EntityInfo[]>;
  stringQueryCache$: Observable<QueryEntity[]>;
  translate: TranslateService;

  init() {
    this.selectedEntities$ = combineLatest([
      this.controlStatus$.pipe(map(controlStatus => controlStatus.value), distinctUntilChanged()),
      this.cacheEntities$,
      this.stringQueryCache$,
      this.settings$.pipe(
        map(settings => ({
          Separator: settings.Separator,
          Value: settings.Value,
          Label: settings.Label,
        })),
        distinctUntilChanged(GeneralHelpers.objectsEqual),
      ),
    ]).pipe(
      map(([value, entityCache, stringQueryCache, settings]) =>
        calculateSelectedEntities(value, settings.Separator, entityCache, stringQueryCache, settings.Value, settings.Label, this.translate)
      ),
    );
    this.allowMultiValue$ = this.settings$.pipe(map(settings => settings.AllowMultiValue), distinctUntilChanged());
    this.shouldPickerListBeShown$ = combineLatest([
      this.freeTextMode$, this.isExpanded$, this.allowMultiValue$, this.selectedEntities$
    ]).pipe(map(([
      freeTextMode, isExpanded, allowMultiValue, selectedEntities
    ]) => {
      return !freeTextMode && selectedEntities.length > 0 && (!allowMultiValue || (allowMultiValue && isExpanded));
    }));
  }

  destroy() {
    this.freeTextMode$.complete();
    this.error$.complete();
    this.disableAddNew$.complete();
  }

  updateAddNew(): void {
    const contentTypeName = this.pickerSourceAdapter.contentTypeMask.resolve();
    this.disableAddNew$.next(!contentTypeName);
  }

  addSelected(guid: string) { this.updateValue('add', guid); }
  removeSelected(index: number) { this.updateValue('delete', index); }
  reorder(reorderIndexes: ReorderIndexes) { this.updateValue('reorder', reorderIndexes); }

  toggleFreeTextMode(): void {
    this.freeTextMode$.next(!this.freeTextMode$.value);
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
