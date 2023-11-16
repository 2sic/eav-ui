import { TranslateService } from '@ngx-translate/core/public_api';
import { WIPDataSourceItem, FieldSettings } from 'projects/edit-types';
import { BehaviorSubject, combineLatest, distinctUntilChanged, map, Observable } from 'rxjs';
import { GeneralHelpers } from '../../../shared/helpers';
import { ControlStatus } from '../../../shared/models';
import { QueryEntity } from '../entity/entity-query/entity-query.models';
import { ReorderIndexes } from './picker-list/picker-list.models';
import { calculateSelectedEntities, convertArrayToString, convertValueToArray } from './picker.helpers';
import { DeleteEntityProps } from './picker.models';
import { AbstractControl } from '@angular/forms';
import { moveItemInArray } from '@angular/cdk/drag-drop';

export class PickerStateAdapter {
  constructor(
    public settings$: BehaviorSubject<FieldSettings> = new BehaviorSubject(null),
    public controlStatus$: BehaviorSubject<ControlStatus<string | string[]>>,
    public isExpanded$: Observable<boolean>,
    public label$: Observable<string>,
    public placeholder$: Observable<string>,
    public required$: Observable<boolean>,
    public cacheItems$: Observable<WIPDataSourceItem[]>,
    public stringQueryCache$: Observable<QueryEntity[]>,

    public translate: TranslateService,

    public control: AbstractControl,

    private focusOnSearchComponent: () => void,
  ) { }

  disableAddNew$: BehaviorSubject<boolean> = new BehaviorSubject(true);
  freeTextMode$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  error$: BehaviorSubject<string> = new BehaviorSubject('');

  shouldPickerListBeShown$: Observable<boolean>;
  selectedItems$: Observable<WIPDataSourceItem[]>;
  allowMultiValue$: Observable<boolean>;
  tooltip$: Observable<string>;
  information$: Observable<string>;
  isDialog$: Observable<boolean>;

  init() {
    this.allowMultiValue$ = this.settings$.pipe(map(settings => settings.AllowMultiValue), distinctUntilChanged());
    this.tooltip$ = this.settings$.pipe(map(settings => settings.Tooltip), distinctUntilChanged());
    this.information$ = this.settings$.pipe(map(settings => settings.Information), distinctUntilChanged());
    this.isDialog$ = this.settings$.pipe(map(settings => settings._isDialog), distinctUntilChanged());
    this.shouldPickerListBeShown$ = combineLatest([
      this.freeTextMode$, this.isExpanded$, this.allowMultiValue$, this.selectedItems$
    ]).pipe(map(([
      freeTextMode, isExpanded, allowMultiValue, selectedItems
    ]) => {
      return !freeTextMode && ((selectedItems.length > 0 && allowMultiValue) || (selectedItems.length > 1 && !allowMultiValue)) && (!allowMultiValue || (allowMultiValue && isExpanded));
    }));
  }

  destroy() {
    this.settings$.complete();
    this.controlStatus$.complete();
    this.disableAddNew$.complete();
    this.freeTextMode$.complete();
    this.error$.complete();
  }

  updateValue(action: 'add' | 'delete' | 'reorder', value: string | number | ReorderIndexes): void {
    const valueArray: string[] = this.createValueArray();

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

    const newValue = this.createNewValue(valueArray);
    GeneralHelpers.patchControlValue(this.control, newValue);

    if (action === 'delete' && !valueArray.length) {
      // move back to component
      setTimeout(() => {
        this.focusOnSearchComponent();
      });
    }
  }

  protected createNewValue(valueArray: string[]): string | string[] {
    return typeof this.control.value === 'string'
      ? convertArrayToString(valueArray, this.settings$.value.Separator)
      : valueArray;
  }

  createValueArray(): string[] {
    if (typeof this.control.value === 'string') {
      return convertValueToArray(this.control.value, this.settings$.value.Separator);
    }
    return [...this.control.value];
  }

  doAfterDelete(props: DeleteEntityProps) {
    this.updateValue('delete', props.index);
  }

  addSelected(guid: string) { this.updateValue('add', guid); }
  removeSelected(index: number) { this.updateValue('delete', index); }
  reorder(reorderIndexes: ReorderIndexes) { this.updateValue('reorder', reorderIndexes); }

  toggleFreeTextMode(): void {
    this.freeTextMode$.next(!this.freeTextMode$.value);
  }
}
