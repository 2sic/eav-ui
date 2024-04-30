import { Component, ElementRef, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { AbstractControl, FormGroup } from '@angular/forms';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { TranslateService } from '@ngx-translate/core';
import { PickerItem } from 'projects/edit-types';
import { BehaviorSubject, combineLatest, distinctUntilChanged, map, Observable, shareReplay, take } from 'rxjs';
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
import { PickerTreeDataService } from '../picker-tree/picker-tree-data-service';
import { messagePickerItem } from '../adapters/picker-source-adapter-base';

const logThis = true;
/** log each detail, eg. item-is-disabled (separate logger) */
const logEachItemChecks = false;

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
  private selectedItem: PickerItem;
  private newValue: string = null;

  private filter$ = new BehaviorSubject(false);

  private log = new EavLogger('PickerSearchComponent', logThis);
  private logItemChecks = new EavLogger('PickerSearchComponent-ItemChecks', logEachItemChecks);

  /**
   * The tree helper which is used by the tree display.
   * Will only be initialized if we're really showing a tree.
   */
  treeHelper: PickerTreeDataHelper;

  constructor(
    private translate: TranslateService,
    private globalConfigService: GlobalConfigService,
    private fieldsSettingsService: FieldsSettingsService,
    private treeDataService: PickerTreeDataService,
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
    
    const freeTextMode$ = state.freeTextMode$;
    const controlStatus$ = state.controlStatus$;
    const error$ = state.error$;
    const label$ = state.label$;
    const required$ = state.required$;

    const debugEnabled$ = this.globalConfigService.getDebugEnabled$();
    const logFieldSettings = this.log.rxTap('fieldSettings$', { enabled: false });
    const fieldSettings$ = this.fieldsSettingsService.getFieldSettings$(this.config.fieldName)
      .pipe(
        logFieldSettings.pipe(),
        distinctUntilChanged(GeneralHelpers.objectsEqual),
        logFieldSettings.distinctUntilChanged(),
        shareReplay(1),
        logFieldSettings.shareReplay(),
      );

    const logSettings = this.log.rxTap('settings$', { enabled: false });
    const settings$ = fieldSettings$.pipe(
      logSettings.pipe(),
      map(settings => ({
        allowMultiValue: settings.AllowMultiValue,
        enableAddExisting: settings.EnableAddExisting,
        enableTextEntry: settings.EnableTextEntry,
        enableEdit: settings.EnableEdit,
        enableDelete: settings.EnableDelete,
        enableRemove: settings.EnableRemove,
        enableReselect: settings.EnableReselect,
        showAsTree: settings.PickerDisplayMode === 'tree',
      })),
      distinctUntilChanged(GeneralHelpers.objectsEqual),
      logSettings.distinctUntilChanged(),
    );

    // const testLog = this.log.rxTap('test$');
    // combineLatest([this.optionItems$,]).pipe(
    //   testLog.pipe(),
    // ).subscribe();

    // Setup Tree Helper - but should only happen, if we're really doing trees
    // ATM we're only doing this the first time, as these settings are not expected to change
    settings$.pipe(take(1)).subscribe(settings => {
      if (!settings.showAsTree) return;
      this.treeDataService.init(fieldSettings$, this.optionItems$);
      this.treeHelper = this.treeDataService.treeHelper;
    });
    

    // Create the default ViewModel used in the other modes
    const vmLog = this.log.rxTap('viewModel$', { enabled: true });
    this.viewModel$ = combineLatest([
      debugEnabled$, settings$, this.pickerData.selectedItems$, this.optionItems$, error$,
      controlStatus$, freeTextMode$, label$, required$, this.filter$,
    ]).pipe(
      vmLog.pipe(),
      map(([
        debugEnabled, settings, selectedItems, optionItems, error,
        controlStatus, freeTextMode, label, required, /* filter: only used for refresh */ _,
      ]) => {
        optionItems = optionItems ?? [];
        const selectedItem = this.selectedItem = selectedItems.length > 0 ? selectedItems[0] : null;

        const showItemEditButtons = selectedItem && this.showItemEditButtons;

        const filterValue = this.autocompleteRef?.nativeElement.value;
        const filterLc = filterValue?.toLocaleLowerCase();
        let filteredItems = !filterValue
          ? optionItems
          : optionItems.filter(oItem => ((oItem.label ? oItem.label : oItem.value) ?? '').toLocaleLowerCase().includes(filterLc));

        const filterOrMessage = filteredItems.length > 0
          ? filteredItems
          : [messagePickerItem(this.translate, 'Fields.Picker.FilterNoResults', { search: filterValue })];

        const viewModel: PickerSearchViewModel = {
          debugEnabled,
          allowMultiValue: settings.allowMultiValue,
          enableAddExisting: settings.enableAddExisting,
          enableTextEntry: settings.enableTextEntry,
          enableEdit: settings.enableEdit && showItemEditButtons,
          enableDelete: settings.enableDelete && showItemEditButtons,
          enableRemove: settings.enableRemove && showItemEditButtons,
          enableReselect: settings.enableReselect,
          selectedItems,
          options: optionItems,
          error,
          controlStatus,
          freeTextMode,
          label,
          required,
          selectedItem,
          filteredItems: filterOrMessage,

          // figure out if tree, and save it for functions to use
          isTreeDisplayMode: settings.showAsTree,
          isDisabled: controlStatus.disabled,
        };
        return viewModel;
      }),
      vmLog.end(),
    );

  }

  ngOnDestroy(): void {
    super.ngOnDestroy();
  }

  displayFn(value: string /* | string[] | PickerItem */): string {
    this.logItemChecks.add(`displayFn: value: '${value}'; selectedItem: `, this.selectedItem);
    // 2024-04-30 2dm: seems this is always a string, will simplify the code
    // and probably clean up if it's stable for a few days
    if (value == null) return '';
    let returnValue = '';
    // if (typeof value === 'string') {
      returnValue = this.optionItems$.value?.find(ae => ae.value == value)?.label;
    // }
    //  else if (Array.isArray(value)) {
    //   if (typeof value[0] === 'string') {
    //     returnValue = this.optionItems$.value?.find(ae => ae.value == value[0])?.label;
    //   } else {
    //     returnValue = (value[0] as PickerItem)?.label;
    //   }
    // } else
    //   returnValue = (value as PickerItem)?.label;
    
    // If nothing yet, try to return label of selected or fallback to return the value
    // note: not quite sure, but I believe this is for scenarios where a manual entry was done
    // ...so it would return it, even though it's not in the list of available items
    if (!returnValue)
      return this.selectedItem?.value == value
        ? this.selectedItem?.label
        : value + " *";
    this.log.add('displayFn result', value, returnValue);  
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

  onOpened(isTreeDisplayMode: boolean): void {
    const domElement = this.autocompleteRef.nativeElement;
    this.log.add(`onOpened: isTreeDisplayMode ${isTreeDisplayMode}; domValue: '${domElement.value}'`);
    // flush the input so the user can use it to search, otherwise the list is filtered
    domElement.value = '';
    // If tree, we need to blur so tree reacts to the first click, otherwise the user must click 2x
    if (isTreeDisplayMode)
      domElement.blur();
  }

  onClosed(selectedItems: PickerItem[], selectedItem: PickerItem): void {
    this.log.add('onClosed', selectedItems, selectedItem);
    if (this.showSelectedItem) {
      // @SDV - improve this
      if (this.newValue && this.newValue != selectedItem?.value) {} //this.autocompleteRef.nativeElement.value = this.availableItems$.value?.find(ae => ae.Value == this.newValue)?.Text;
      else if (selectedItem && selectedItems.length < 2)
        this.autocompleteRef.nativeElement.value = selectedItem.label;
    } else {
      // @SDV - improve this
      this.autocompleteRef.nativeElement.value = '';
    }
  }

  optionSelected(event: MatAutocompleteSelectedEvent, allowMultiValue: boolean, selectedEntity: PickerItem): void {
    this.logItemChecks.add('optionSelected', event.option.value);
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
    // this.log.add(`getPlaceholder error: '${error}'`, availableEntities);
    var placeholder = availableEntities?.length > 0
      ? this.translate.instant('Fields.Picker.Search')
      : this.translate.instant('Fields.Picker.QueryNoItems');
    this.logItemChecks.add(`getPlaceholder error: '${error}'; result '${placeholder}'`, availableEntities);
    return placeholder;
  }

  toggleFreeText(disabled: boolean): void {
    this.log.add('toggleFreeText', disabled);
    if (disabled) { return; }
    this.pickerData.state.toggleFreeTextMode();
  }

  insertNull(): void {
    this.log.add('insertNull');
    this.pickerData.state.addSelected(null);
  }

  isOptionDisabled(value: string, selectedEntities: PickerItem[]): boolean {
    const isSelected = selectedEntities.some(entity => entity.value === value);
    this.logItemChecks.add(`sOptionDisabled value: '${value}'; result: ${isSelected}`, selectedEntities);
    return isSelected;
  }

  edit(entityGuid: string, entityId: number): void {
    this.log.add(`edit guid: '${entityGuid}'; id: '${entityId}'`);
    this.pickerData.source.editItem({ entityGuid, entityId }, null);
  }

  removeItem(index: number): void {
    this.log.add(`removeItem index: '${index}'`);
    this.pickerData.state.removeSelected(index);
  }

  deleteItem(index: number, entityGuid: string): void {
    this.log.add(`deleteItem index: '${index}'; entityGuid: '${entityGuid}'`);
    this.pickerData.source.deleteItem({ index, entityGuid });
  }

  goToLink(helpLink: string): void {
    this.log.add(`goToLink helpLink: '${helpLink}'`);
    window.open(helpLink, '_blank');
  }

  hasChild = (_: number, item: PickerTreeItem) => this.treeHelper.hasChild(_, item);

}