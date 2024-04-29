import { Component, ElementRef, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { AbstractControl, FormGroup } from '@angular/forms';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { TranslateService } from '@ngx-translate/core';
import { PickerItem } from 'projects/edit-types';
import { BehaviorSubject, combineLatest, distinctUntilChanged, map, Observable } from 'rxjs';
import { GeneralHelpers } from '../../../../shared/helpers';
import { FieldsSettingsService } from '../../../../shared/services';
import { GlobalConfigService } from '../../../../shared/store/ngrx-data';
import { PickerSearchViewModel } from './picker-search.models';
import { FieldConfigSet, FieldControlConfig } from '../../../builder/fields-builder/field-config-set.model';
import { Field } from '../../../builder/fields-builder/field.model';
import { BaseSubsinkComponent } from 'projects/eav-ui/src/app/shared/components/base-subsink-component/base-subsink.component';
import { PickerData } from '../picker-data';
import { EavLogger } from 'projects/eav-ui/src/app/shared/logging/eav-logger';
import { PickerTreeItem } from '../models/picker-tree.models';
import { PickerTreeDataHelper } from '../picker-tree/picker-tree-data-helper';

const logThis = false;

@Component({
  selector: 'app-picker-search',
  templateUrl: './picker-search.component.html',
  styleUrls: ['./picker-search.component.scss'],
  // imports: [
  //   PickerHelpComponentComponent,
  // ]
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

  optionItems$ = new BehaviorSubject<PickerItem[]>(null);
  private selectedItems$ = new Observable<PickerItem[]>;
  private selectedItem$ = new BehaviorSubject<PickerItem>(null);
  private newValue: string = null;
  private isTreeDisplayMode: boolean = false;

  private filter$ = new BehaviorSubject(false);

  private log = new EavLogger('PickerSearchComponent', logThis);

  /**
   * The tree helper must be generated early, and then populated later
   */
  treeHelper = new PickerTreeDataHelper();

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

    // TODO: @2dm - maybe there is even a more elegant way to do this
    // TODO: @SDV - check if there is a way to transform availableItems$ to a Observable<PickerItem[]>
    if (false) {
      this.subscription.add(
        this.fieldsSettingsService.processPickerItems$(this.config.fieldName, source.optionsOrHints$).subscribe((items) => this.optionItems$.next(items))
      );
    } else {
      this.optionItems$ = source.optionsOrHints$;
    }
    
    this.selectedItems$ = this.pickerData.selectedItems$;

    const freeTextMode$ = state.freeTextMode$;
    const controlStatus$ = state.controlStatus$;
    const error$ = state.error$;
    const label$ = state.label$;
    const required$ = state.required$;

    const debugEnabled$ = this.globalConfigService.getDebugEnabled$();
    const setLog = this.log.rxTap('settings$');
    const settings$ = this.fieldsSettingsService.getFieldSettings$(this.config.fieldName).pipe(
      setLog.pipe(),
      map(settings => ({
        AllowMultiValue: settings.AllowMultiValue,
        EnableAddExisting: settings.EnableAddExisting,
        EnableTextEntry: settings.EnableTextEntry,
        EnableEdit: settings.EnableEdit,
        EnableDelete: settings.EnableDelete,
        EnableRemove: settings.EnableRemove,
        EnableReselect: settings.EnableReselect,
        PickerDisplayMode: settings.PickerDisplayMode,
        pickerTreeConfig: settings.PickerTreeConfiguration,
      })),
      distinctUntilChanged(GeneralHelpers.objectsEqual),
      setLog.distinctUntilChanged(),
    );

    const testLog = this.log.rxTap('test$');
    combineLatest([this.optionItems$,]).pipe(
      testLog.pipe(),
    ).subscribe();

    const vmLog = this.log.rxTap('viewModel$');
    this.viewModel$ = combineLatest([
      debugEnabled$, settings$, this.selectedItems$, this.optionItems$, error$,
      controlStatus$, freeTextMode$, label$, required$, this.filter$,
    ]).pipe(
      vmLog.pipe(),
      map(([
        debugEnabled, settings, selectedItems, optionItems, error,
        controlStatus, freeTextMode, label, required, /* filter: only used for refresh */ _,
      ]) => {
        const selectedItem = selectedItems.length > 0 ? selectedItems[0] : null;
        this.selectedItem$.next(selectedItem);

        const showItemEditButtons = selectedItem && this.showItemEditButtons;
        this.isTreeDisplayMode = settings.PickerDisplayMode === 'tree';

        const elemValue = this.autocompleteRef?.nativeElement.value;
        const elemValLowerCase = elemValue?.toLocaleLowerCase();
        const filteredItems = !elemValue ? optionItems : optionItems?.filter(oItem =>
          ((oItem.label ? oItem.label : oItem.value) ?? '').toLocaleLowerCase().includes(elemValLowerCase)
        );

        // TODO: @SDV -> tree expand by default and test search (search has to show parents)
        if (this.isTreeDisplayMode) {
          if (optionItems && optionItems[0]?.data != undefined) {
            // TODO: this is a wild side-effect!
            const treeConfig = settings.pickerTreeConfig;
            this.treeHelper.updateConfig(treeConfig);
            this.treeHelper.addOptionItems(this.optionItems$);

            const filteredData = optionItems.filter(x => (treeConfig?.TreeRelationship == 'parent-child') //check for two streams type also
              ? !optionItems.some(y => y.data[treeConfig?.TreeParentChildRefField]?.some((z: { Id: number; }) => z.Id === x.id))
              : x.data[treeConfig?.TreeChildParentRefField]?.length == 0);
            this.treeHelper.updateSelectedData(filteredData);
          }   
        }

        const csDisabled = controlStatus.disabled;

        const viewModel: PickerSearchViewModel = {
          debugEnabled,
          allowMultiValue: settings.AllowMultiValue,
          enableAddExisting: settings.EnableAddExisting,
          enableTextEntry: settings.EnableTextEntry,
          enableEdit: settings.EnableEdit && showItemEditButtons,
          enableDelete: settings.EnableDelete && showItemEditButtons,
          enableRemove: settings.EnableRemove && showItemEditButtons,
          enableReselect: settings.EnableReselect,
          selectedItems,
          options: optionItems,
          error,
          controlStatus,
          freeTextMode,
          label,
          required,
          selectedItem,
          filteredItems,

          // additional properties for easier readability in the template
          // showItemEditButtons,
          isTreeDisplayMode: this.isTreeDisplayMode,
          csDisabled,
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
        returnValue = this.optionItems$.value?.find(ae => ae.value == value)?.label;
      } else if (Array.isArray(value)) {
        if (typeof value[0] === 'string') {
          returnValue = this.optionItems$.value?.find(ae => ae.value == value[0])?.label;
        } else {
          returnValue = (value[0] as PickerItem)?.label;
        }
      }
      else
        returnValue = (value as PickerItem)?.label;
    }
    if (!returnValue) {
      if (this.selectedItem$.value?.value == value) {
        returnValue = this.selectedItem$.value?.label;
      } else {
        returnValue = value + " *";
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
    if (this.isTreeDisplayMode) {
      this.autocompleteRef.nativeElement.blur();//needed so tree reacts to the first click
    }
      
  }

  onClosed(selectedItems: PickerItem[], selectedItem: PickerItem): void { 
    if (this.showSelectedItem) {
      // @SDV - improve this
      if (this.newValue && this.newValue != selectedItem?.value) {} //this.autocompleteRef.nativeElement.value = this.availableItems$.value?.find(ae => ae.Value == this.newValue)?.Text;
      else if (selectedItem && selectedItems.length < 2) this.autocompleteRef.nativeElement.value = selectedItem.label;
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
    const isSelected = selectedEntities.some(entity => entity.value === value);
    return isSelected;
  }

  edit(entityGuid: string, entityId: number): void {
    this.pickerData.source.editItem({ entityGuid, entityId }, null);
  }

  removeItem(index: number): void {
    this.pickerData.state.removeSelected(index);
  }

  deleteItem(index: number, entityGuid: string): void {
    this.pickerData.source.deleteItem({ index, entityGuid });
  }

  goToLink(helpLink: string): void {
    window.open(helpLink, '_blank');
  }

  hasChild = (_: number, item: PickerTreeItem) => this.treeHelper.hasChild(_, item);

}