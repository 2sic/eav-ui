import { TranslateService } from '@ngx-translate/core/public_api';
import { PickerItem, FieldSettings } from 'projects/edit-types';
import { BehaviorSubject, combineLatest, distinctUntilChanged, map, Observable, tap } from 'rxjs';
import { GeneralHelpers } from '../../../../shared/helpers';
import { ControlStatus } from '../../../../shared/models';
import { QueryEntity } from '../../entity/entity-query/entity-query.models';
import { ReorderIndexes } from '../picker-list/picker-list.models';
import { convertArrayToString, convertValueToArray, equalizeSelectedItems } from '../picker.helpers';
import { DeleteEntityProps } from '../picker.models';
import { AbstractControl } from '@angular/forms';
import { moveItemInArray } from '@angular/cdk/drag-drop';
import { EavService } from '../../../../shared/services';

export class PickerStateAdapter {
  public disableAddNew$: BehaviorSubject<boolean> = new BehaviorSubject(true);
  public freeTextMode$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  public error$: BehaviorSubject<string> = new BehaviorSubject('');

  public shouldPickerListBeShown$: Observable<boolean>;
  public selectedItems$: Observable<PickerItem[]>;
  public allowMultiValue$: Observable<boolean>;
  public isDialog$: Observable<boolean>;

  public createEntityTypes: { label: string, guid: string }[] = [];


  constructor(
    public settings$: BehaviorSubject<FieldSettings> = new BehaviorSubject(null),
    public controlStatus$: BehaviorSubject<ControlStatus<string | string[]>>,
    public isExpanded$: Observable<boolean>,
    public label$: Observable<string>,
    public placeholder$: Observable<string>,
    public required$: Observable<boolean>,
    public cacheItems$: Observable<PickerItem[]>,
    public stringQueryCache$: Observable<QueryEntity[]>,
    public translate: TranslateService,
    public control: AbstractControl,
    public eavService: EavService,
    private focusOnSearchComponent: () => void,
  ) { }

  init() {
    this.selectedItems$ = combineLatest([
      this.controlStatus$.pipe(map(controlStatus => controlStatus.value), distinctUntilChanged()),
      this.settings$.pipe(
        tap(settings => {
          // TODO: this looks bad - side-effect in observable
          const types = settings.CreateTypes;
          this.createEntityTypes = types
            ? types
                // use either \n or , as delimiter
                .split(types.indexOf('\n') > -1 ? '\n' : ',')
                .map((guid: string) => ({ label: null, guid }))
            : [];
        }),
        map(settings => ({
          Separator: settings.Separator,
          Options: settings._options,
        })),
        distinctUntilChanged(GeneralHelpers.objectsEqual),
      ),
    ]).pipe(
      map(([value, settings]) =>
        equalizeSelectedItems(value, settings.Separator, settings.Options)
      ),
    );
    this.allowMultiValue$ = this.settings$.pipe(map(settings => settings.AllowMultiValue), distinctUntilChanged());
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
    let valueArray: string[] = this.createValueArray();

    switch (action) {
      case 'add':
        const guid = value as string;
        if(this.settings$.value.AllowMultiValue)
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

  getEntityTypesData(): void {
    if (this.createEntityTypes[0].label) { return; }
    this.createEntityTypes.forEach(entityType => {
      const ct = this.eavService.settings.ContentTypes.find(ct => ct.Id === entityType.guid || ct.Name == entityType.guid);
      entityType.label = ct?.Name ?? entityType.guid + " (not found)";
      entityType.guid = ct?.Id ?? entityType.guid;
    });
  }
}
