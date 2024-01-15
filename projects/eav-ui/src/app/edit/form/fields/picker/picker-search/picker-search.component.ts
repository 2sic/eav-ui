import { Component, ElementRef, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { AbstractControl, FormGroup } from '@angular/forms';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { TranslateService } from '@ngx-translate/core';
import { PickerItem, PickerTreeItem, TreeItem, UiPickerModeTree } from 'projects/edit-types';
import { BehaviorSubject, combineLatest, distinctUntilChanged, map, Observable } from 'rxjs';
import { GeneralHelpers } from '../../../../shared/helpers';
import { FieldsSettingsService } from '../../../../shared/services';
import { GlobalConfigService } from '../../../../shared/store/ngrx-data';
import { PickerSearchViewModel } from './picker-search.models';
import { FieldConfigSet, FieldControlConfig } from '../../../builder/fields-builder/field-config-set.model';
import { Field } from '../../../builder/fields-builder/field.model';
import { BaseSubsinkComponent } from 'projects/eav-ui/src/app/shared/components/base-subsink-component/base-subsink.component';
import { PickerData } from '../picker-data';
import { MatTreeFlatDataSource, MatTreeFlattener } from '@angular/material/tree';
import { FlatTreeControl } from '@angular/cdk/tree';

@Component({
  selector: 'app-picker-search',
  templateUrl: './picker-search.component.html',
  styleUrls: ['./picker-search.component.scss'],
})
export class PickerSearchComponent extends BaseSubsinkComponent implements OnInit, OnDestroy, Field {
  @ViewChild('autocomplete') autocompleteRef?: ElementRef;

  @Input() pickerData: PickerData;
  @Input() config: FieldConfigSet;
  @Input() group: FormGroup;
  @Input() controlConfig: FieldControlConfig;
  @Input() showSelectedItem: boolean;
  @Input() showItemEditButtons: boolean;

  viewModel$: Observable<PickerSearchViewModel>;
  private control: AbstractControl;

  private pickerTreeConfiguration: UiPickerModeTree;
  dataSource: MatTreeFlatDataSource<TreeItem, PickerTreeItem, PickerTreeItem>;

  private availableItems$ = new BehaviorSubject<PickerItem[]>(null);
  private selectedItems$ = new Observable<PickerItem[]>;
  private selectedItem$ = new BehaviorSubject<PickerItem>(null);
  private newValue: string = null;

  private filter$ = new BehaviorSubject(false);

  constructor(
    private translate: TranslateService,
    private globalConfigService: GlobalConfigService,
    private fieldsSettingsService: FieldsSettingsService,
  ) {
    super();
  }

  ngOnInit(): void {
    const state = this.pickerData.state;
    const source = this.pickerData.source;
    this.control = this.group.controls[this.config.fieldName];
    this.dataSource = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener);

    this.availableItems$ = source.availableItems$;
    this.selectedItems$ = this.pickerData.selectedItems$;

    const freeTextMode$ = state.freeTextMode$;
    const controlStatus$ = state.controlStatus$;
    const error$ = state.error$;
    const label$ = state.label$;
    const required$ = state.required$;

    const debugEnabled$ = this.globalConfigService.getDebugEnabled$();
    const settings$ = this.fieldsSettingsService.getFieldSettings$(this.config.fieldName).pipe(
      map(settings => ({
        AllowMultiValue: settings.AllowMultiValue,
        EnableAddExisting: settings.EnableAddExisting,
        EnableTextEntry: settings.EnableTextEntry,
        EnableEdit: settings.EnableEdit,
        EnableDelete: settings.EnableDelete,
        EnableRemove: settings.EnableRemove,
        EnableReselect: settings.EnableReselect,
        PickerDisplayMode: settings.PickerDisplayMode,
        PickerTreeConfiguration: settings.PickerTreeConfiguration,
      })),
      distinctUntilChanged(GeneralHelpers.objectsEqual),
    );
    this.viewModel$ = combineLatest([
      debugEnabled$, settings$, this.selectedItems$, this.availableItems$, error$,
      controlStatus$, freeTextMode$, label$, required$, this.filter$
    ]).pipe(
      map(([
        debugEnabled, settings, selectedItems, availableItems, error,
        controlStatus, freeTextMode, label, required, filter
      ]) => {
        const selectedItem = selectedItems.length > 0 ? selectedItems[0] : null;
        this.selectedItem$.next(selectedItem);

        const showEmpty = !settings.EnableAddExisting && !(selectedItems.length > 1);
        const hideDropdown = (!settings.AllowMultiValue && (selectedItems.length > 1)) || !settings.EnableAddExisting;
        const showItemEditButtons = selectedItem && this.showItemEditButtons;
        const isTreeDisplayMode = settings.PickerDisplayMode === 'tree';

        const elemValue = this.autocompleteRef?.nativeElement.value;
        const filteredItems = !elemValue ? availableItems : availableItems?.filter(option =>
          option.Text
            ? option.Text.toLocaleLowerCase().includes(elemValue.toLocaleLowerCase())
            : option.Value.toLocaleLowerCase().includes(elemValue.toLocaleLowerCase())
        );

        if (isTreeDisplayMode/*settings.PickerTreeConfiguration*/) {
          this.pickerTreeConfiguration = settings.PickerTreeConfiguration;
          const filteredData = availableItems.filter(x => x[this.pickerTreeConfiguration?.TreeChildParentRefField]?.length == 0);
          this.dataSource.data = filteredData;
        }

        const viewModel: PickerSearchViewModel = {
          debugEnabled,
          allowMultiValue: settings.AllowMultiValue,
          enableAddExisting: settings.EnableAddExisting,
          enableTextEntry: settings.EnableTextEntry,
          enableEdit: settings.EnableEdit,
          enableDelete: settings.EnableDelete,
          enableRemove: settings.EnableRemove,
          enableReselect: settings.EnableReselect,
          pickerTreeConfiguration: settings.PickerTreeConfiguration,
          selectedItems,
          availableItems,
          error,
          controlStatus,
          freeTextMode,
          label,
          required,
          selectedItem,
          filteredItems,

          // additional properties for easier readability in the template
          showEmpty,
          hideDropdown,
          showItemEditButtons,
          isTreeDisplayMode,
        };
        return viewModel;
      }),
    );
  }

  ngOnDestroy(): void {
    super.ngOnDestroy();
  }

  displayFn(value: string | string[] | PickerItem): string {
    let returnValue = '';
    if (value != null || value != undefined) {
      if (typeof value === 'string') {
        returnValue = this.availableItems$.value?.find(ae => ae.Value == value)?.Text;
      } else if (Array.isArray(value)) {
        if (typeof value[0] === 'string') {
          returnValue = this.availableItems$.value?.find(ae => ae.Value == value[0])?.Text;
        } else {
          returnValue = (value[0] as PickerItem)?.Text;
        }
      }
      else
        returnValue = (value as PickerItem)?.Text;
    }
    if (!returnValue) {
      if (this.selectedItem$.value?.Value == value) {
        returnValue = this.selectedItem$.value?.Text;
      } else {
        returnValue = value as string;
      }
    }
    return returnValue;
  }

  markAsTouched(): void {
    GeneralHelpers.markControlTouched(this.control);
  }

  fetchEntities(): void {
    this.pickerData.source.fetchItems();
  }

  filterSelectionList(): void {
    this.filter$.next(true);
  }

  onOpened(): void {
    this.autocompleteRef.nativeElement.value = '';
  }

  onClosed(selectedItems: PickerItem[], selectedItem: PickerItem): void { 
    if (this.showSelectedItem) {
      // @SDV - improve this
      if (this.newValue && this.newValue != selectedItem?.Value) {} //this.autocompleteRef.nativeElement.value = this.availableItems$.value?.find(ae => ae.Value == this.newValue)?.Text;
      else if (selectedItem && selectedItems.length < 2) this.autocompleteRef.nativeElement.value = selectedItem.Text;
    } else {
      // @SDV - improve this
      this.autocompleteRef.nativeElement.value = '';
    }
  }

  optionSelected(event: MatAutocompleteSelectedEvent, allowMultiValue: boolean, selectedEntity: PickerItem): void {
    this.newValue = event.option.value;
    if (!allowMultiValue && selectedEntity) this.removeItem(0);
    const selected: string = event.option.value;
    this.pickerData.state.addSelected(selected);
    // @SDV - This is needed so after choosing option element is not focused (it gets focused by default so if blur is outside of setTimeout it will happen before refocus)
    setTimeout(() => {
      this.autocompleteRef.nativeElement.blur();
    });
  }

  getPlaceholder(availableEntities: PickerItem[], error: string): string {
    if (availableEntities?.length > 0) {
      return this.translate.instant('Fields.Entity.Search');
    }
    return this.translate.instant('Fields.EntityQuery.QueryNoItems');
  }

  toggleFreeText(disabled: boolean): void {
    if (disabled) { return; }
    this.pickerData.state.toggleFreeTextMode();
  }

  insertNull(): void {
    this.pickerData.state.addSelected(null);
  }

  isOptionDisabled(value: string, selectedEntities: PickerItem[]): boolean {
    const isSelected = selectedEntities.some(entity => entity.Value === value);
    return isSelected;
  }

  isOptionUnpickable(item: PickerTreeItem, selectedEntities: PickerItem[], enableReselect: boolean, pickerTreeConfiguration: UiPickerModeTree): boolean {
    const isUnpickableBySelection = enableReselect ? false : selectedEntities.some(entity => entity.Value === item.Value);
    const isRootUnpickableByConfiguration = pickerTreeConfiguration?.TreeAllowSelectRoot ? false : item.Children?.length > 0 && item.Parent?.length === 0;
    const isBranchUnpickableByConfiguration = pickerTreeConfiguration?.TreeAllowSelectBranch ? false : item.Children?.length > 0 && item.Parent?.length > 0;
    const isLeafUnpickableByConfiguration = pickerTreeConfiguration?.TreeAllowSelectLeaves ? false : item.Children?.length === 0;
    return isUnpickableBySelection || isRootUnpickableByConfiguration || isBranchUnpickableByConfiguration || isLeafUnpickableByConfiguration;
  }

  edit(entityGuid: string, entityId: number): void {
    this.pickerData.source.editItem({ entityGuid, entityId });
  }

  removeItem(index: number): void {
    this.pickerData.state.removeSelected(index);
  }

  deleteItem(index: number, entityGuid: string): void {
    this.pickerData.source.deleteItem({ index, entityGuid });
  }

  /** Needed later for tree implementation testing */
  treeControl = new FlatTreeControl<PickerTreeItem>(
    item => item.Level,
    item => item.Expandable,
  );

  treeFlattener: MatTreeFlattener<TreeItem, PickerTreeItem> = new MatTreeFlattener(
    (item, Level) => {
      return {
        Level: Level,
        Expandable: (this.pickerTreeConfiguration?.TreeRelationship == 'parent-child') ? //check for two streams type also
          !!(item as TreeItem)[this.pickerTreeConfiguration?.TreeParentChildRefField] && (item as TreeItem)[this.pickerTreeConfiguration?.TreeParentChildRefField].length > 0 :
          this.availableItems$.value.filter(x => {
            if (x[this.pickerTreeConfiguration?.TreeChildParentRefField] != undefined)
              return x[this.pickerTreeConfiguration?.TreeChildParentRefField][0]?.Id == item.Id;//check if this Id is something variable
            }).length > 0,
        Value: item.Value,
        Text: item.Text,
        Parent: (item as TreeItem)[this.pickerTreeConfiguration?.TreeChildParentRefField],
        Children: (item as TreeItem)[this.pickerTreeConfiguration?.TreeParentChildRefField],
      };
    },
    (item) => { return item.Level; },
    (item) => { return item.Expandable; },
    (item) => {
      if (this.pickerTreeConfiguration?.TreeRelationship == 'parent-child') {
        return this.availableItems$.value.filter(x => {
          if (x[this.pickerTreeConfiguration?.TreeChildParentRefField] != undefined)
            return x[this.pickerTreeConfiguration?.TreeChildParentRefField][0]?.Id == item.Id;//check if this Id is something variable
        });
      } else if (this.pickerTreeConfiguration?.TreeRelationship == 'child-parent') {
        return (item as TreeItem)[this.pickerTreeConfiguration?.TreeParentChildRefField].map((x: any) => {
          const child = this.availableItems$.value.find(y => (y as any)[this.pickerTreeConfiguration?.TreeChildIdField] == (x as any)[this.pickerTreeConfiguration?.TreeChildIdField]);
          return child;
        });
      }
    },
  );

  hasChild = (_: number, item: PickerTreeItem) => item.Expandable;
}