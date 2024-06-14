import { Component, ElementRef, Input, OnDestroy, OnInit, Signal, ViewChild, computed, effect, input } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteSelectedEvent, MatAutocompleteModule } from '@angular/material/autocomplete';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { PickerItem } from 'projects/edit-types';
import { BehaviorSubject, combineLatest, map, Observable, switchAll, take } from 'rxjs';
import { FieldsSettingsService } from '../../../../shared/services';
import { GlobalConfigService } from '../../../../shared/store/ngrx-data';
import { PickerSearchViewModel } from './picker-search.models';
import { FieldConfigSet, FieldControlConfig } from '../../../builder/fields-builder/field-config-set.model';
import { Field } from '../../../builder/fields-builder/field.model';
import { PickerData } from '../picker-data';
import { MatTreeModule } from '@angular/material/tree';
import { MatOptionModule } from '@angular/material/core';
import { SharedComponentsModule } from '../../../../../shared/shared-components.module';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { ExtendedModule } from '@angular/flex-layout/extended';
import { NgClass, AsyncPipe, JsonPipe } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { EavLogger } from 'projects/eav-ui/src/app/shared/logging/eav-logger';
import { PickerTreeDataHelper } from '../picker-tree/picker-tree-data-helper';
import { PickerTreeDataService } from '../picker-tree/picker-tree-data-service';
import { messagePickerItem } from '../adapters/data-adapter-base';
import { PickerTreeItem } from '../models/picker-tree.models';
import { PickerIconHelpComponent } from "../picker-icon-help/picker-icon-help.component";
import { PickerIconInfoComponent } from "../picker-icon-info/picker-icon-info.component";
import { BaseComponent } from 'projects/eav-ui/src/app/shared/components/base.component';
import { ClickStopPropagationDirective } from 'projects/eav-ui/src/app/shared/directives/click-stop-propagation.directive';
import { ControlHelpers } from '../../../../shared/helpers/control.helpers';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';

const logThis = false;
/** log each detail, eg. item-is-disabled (separate logger) */
const logEachItemChecks = false;

@Component({
  selector: 'app-picker-search',
  templateUrl: './picker-search.component.html',
  styleUrls: ['./picker-search.component.scss'],
  standalone: true,
  imports: [
    MatFormFieldModule,
    FormsModule,
    ReactiveFormsModule,
    NgClass,
    ExtendedModule,
    MatInputModule,
    MatAutocompleteModule,
    MatButtonModule,
    MatIconModule,
    SharedComponentsModule,
    MatOptionModule,
    MatTreeModule,
    AsyncPipe,
    TranslateModule,
    PickerIconHelpComponent,
    PickerIconInfoComponent,
    ClickStopPropagationDirective,
    // WIP
    JsonPipe,
  ]
})
export class PickerSearchComponent extends BaseComponent implements OnInit, OnDestroy, Omit<Field, 'config'> {
  @ViewChild('autocomplete') autocompleteRef?: ElementRef;

  pickerData = input.required<PickerData>()
  config = input.required<FieldConfigSet>()
  @Input({ required: true }) group: FormGroup;
  @Input({ required: true }) controlConfig: FieldControlConfig;

  /** Determine if the input field shows the selected items. eg. not when in dialog where it's just a search-box */
  showSelectedItem = input.required<boolean>();

  /** Determine if edit buttons are possible, eg. not in preview */
  showItemEditButtons = input.required<boolean>();

  viewModel$: Observable<PickerSearchViewModel>;

  private optionItems$ = new BehaviorSubject<PickerItem[]>(null);

  private newValue: string = null;

  /** All Selected Items */
  public selectedItems = computed(() => this.pickerData().selectedItemsSig());

  /** Currently selected 1 item, as this input will only ever show 1 and it needs to know if certain edit buttons should be shown. */
  public selectedItem = computed(() => this.pickerData().selectedItemSig());

  /** True/false trigger to trigger filtering */
  private triggerFilter = new BehaviorSubject(false);

  /** Special log which would fire a lot for each item doing disabled checks etc. */
  private logItemChecks = new EavLogger('PickerSearchComponent-ItemChecks', logEachItemChecks);

  /** Debug status for UI, mainly to show "add-null" button */
  debugEnabled = toSignal(this.globalConfigService.getDebugEnabled$(), { initialValue: false });

  /** Label to show from the picker data. Is not auto-attached, since it's not the initial/top-level component. */
  label = computed(() => this.pickerData().state.label());

  /** Current applicable settings like "enableEdit" etc. */
  settings = computed(() => {
    const selected = this.selectedItem();
    const show = this.showItemEditButtons() && !!selected;
    const sts = this.fieldsSettingsService.getFieldSettings(this.config().fieldName);
    return {
      allowMultiValue: sts.AllowMultiValue,
      enableAddExisting: sts.EnableAddExisting,
      enableTextEntry: sts.EnableTextEntry,
      enableEdit: sts.EnableEdit && show && !selected?.noEdit,
      enableDelete: sts.EnableDelete && show && !selected?.noDelete,
      enableRemove: sts.EnableRemove && show,
      enableReselect: sts.EnableReselect,
      showAsTree: sts.PickerDisplayMode === 'tree',
    };
  });

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
    super(new EavLogger('PickerSearchComponent', logThis));
  }

  ngOnInit(): void {
    const pickerData = this.pickerData();
    const config = this.config();
    const state = pickerData.state;
    const source = pickerData.source;

    // TODO: @2dm - maybe there is even a more elegant way to do this
    // TODO: @SDV - check if there is a way to transform availableItems$ to a Observable<PickerItem[]>
    if (false) {
      this.subscriptions.add(
        this.fieldsSettingsService.processPickerItems$(config.fieldName, source.optionsOrHints$).subscribe((items) => this.optionItems$.next(items))
      );
    } else {
      this.optionItems$ = source.optionsOrHints$;
    }

    const controlStatus$ = state.controlStatus$;
    const required$ = state.required$;

    const fieldSettings$ = this.fieldsSettingsService.getFieldSettingsReplayed$(config.fieldName);

    // Setup Tree Helper - but should only happen, if we're really doing trees
    // ATM we're only doing this the first time, as these settings are not expected to change
    fieldSettings$.pipe(take(1)).subscribe(settings => {
      if (settings.PickerDisplayMode !== 'tree') return;
      this.treeDataService.init(fieldSettings$, this.optionItems$);
      this.treeHelper = this.treeDataService.treeHelper;
    });


    // Create the default ViewModel used in the other modes
    const logVm = this.log.rxTap('viewModel$', { enabled: true });
    this.viewModel$ = combineLatest([
      this.optionItems$, 
      controlStatus$, required$, this.triggerFilter,
    ]).pipe(
      logVm.pipe(),
      map(([
        optionItems,
        controlStatus, required, /* filter: only used for refresh */ _,
      ]) => {
        optionItems = optionItems ?? [];

        const filterValue = this.autocompleteRef?.nativeElement.value;
        const filterLc = filterValue?.toLocaleLowerCase();
        let filteredItems = !filterValue
          ? optionItems
          : optionItems.filter(oItem => ((oItem.label ? oItem.label : oItem.value) ?? '').toLocaleLowerCase().includes(filterLc));
          // idea to combine key & value - needs further thinking, otherwise the GUID is in there too
          // : optionItems.filter(opt => (`${opt.label} ${opt.value}`).toLocaleLowerCase().includes(filterLc));

        // If the list is empty, show a message about this.
        const filterOrMessage = filteredItems.length > 0
          ? filteredItems
          : [messagePickerItem(this.translate, 'Fields.Picker.FilterNoResults', { search: filterValue })];

        const viewModel: PickerSearchViewModel = {
          options: optionItems,
          controlStatus,
          required,
          filteredItems: filterOrMessage,

          // figure out if tree, and save it for functions to use
          isDisabled: controlStatus.disabled,
        };
        return viewModel;
      }),
      logVm.end(),
    );

  }

  ngOnDestroy(): void {
    super.ngOnDestroy();
  }

  // 2024-04-30 2dm: seems this is always a string, will simplify the code
  displayFn(value: string /* | string[] | PickerItem */): string {
    const selectedItem = this.selectedItem();
    this.logItemChecks.add(`displayFn: value: '${value}'; selectedItem: `, selectedItem);
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
      return selectedItem?.value == value
        ? selectedItem?.label
        : value + " *";
    this.log.a('displayFn result', [value, returnValue]);
    return returnValue;
  }

  markAsTouched(): void {
    const control = this.group.controls[this.config().fieldName];
    ControlHelpers.markControlTouched(control);
  }

  fetchEntities(): void {
    this.pickerData().source.fetchItems();
  }

  filterSelectionList(): void {
    this.triggerFilter.next(true);
  }

  /**
   * Event triggered when opening the auto-complete / search
   */
  onOpened(isTreeDisplayMode: boolean): void {
    const domElement = this.autocompleteRef.nativeElement;
    this.log.a(`onOpened: isTreeDisplayMode ${isTreeDisplayMode}; domValue: '${domElement.value}'`);
    // flush the input so the user can use it to search, otherwise the list is filtered
    domElement.value = '';
    // If tree, we need to blur so tree reacts to the first click, otherwise the user must click 2x
    if (isTreeDisplayMode)
      domElement.blur();
  }

  onClosed(selectedItems: PickerItem[], selectedItem: PickerItem): void {
    this.log.a('onClosed', [selectedItems, selectedItem]);
    if (this.showSelectedItem()) {
      // @SDV - improve this
      if (this.newValue && this.newValue != selectedItem?.value) {
        //this.autocompleteRef.nativeElement.value = this.availableItems$.value?.find(ae => ae.Value == this.newValue)?.Text;
      }
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
    this.pickerData().state.addSelected(selected);
    // @SDV - This is needed so after choosing option element is not focused (it gets focused by default so if blur is outside of setTimeout it will happen before refocus)
    setTimeout(() => {
      this.autocompleteRef.nativeElement.blur();
    });
  }

  getPlaceholder(availableEntities: PickerItem[]): string {
    // this.log.a(`getPlaceholder error: '${error}'`, availableEntities);
    var placeholder = availableEntities?.length > 0
      ? this.translate.instant('Fields.Picker.Search')
      : this.translate.instant('Fields.Picker.QueryNoItems');
    this.logItemChecks.add(`getPlaceholder error: result '${placeholder}'`, availableEntities);
    return placeholder;
  }

  toggleFreeText(disabled: boolean): void {
    this.log.a(`toggleFreeText ${disabled}`);
    if (disabled) { return; }
    this.pickerData().state.toggleFreeTextMode();
  }

  insertNull(): void {
    this.log.a('insertNull');
    this.pickerData().state.addSelected(null);
  }

  isOptionDisabled(value: string, selectedEntities: PickerItem[]): boolean {
    const isSelected = selectedEntities.some(entity => entity.value === value);
    this.logItemChecks.a(`sOptionDisabled value: '${value}'; result: ${isSelected}`, selectedEntities);
    return isSelected;
  }

  edit(entityGuid: string, entityId: number): void {
    this.log.a(`edit guid: '${entityGuid}'; id: '${entityId}'`);
    this.pickerData().source.editItem({ entityGuid, entityId }, null);
  }

  removeItem(index: number): void {
    this.log.a(`removeItem index: '${index}'`);
    this.pickerData().state.removeSelected(index);
  }

  deleteItem(index: number, entityGuid: string): void {
    this.log.a(`deleteItem index: '${index}'; entityGuid: '${entityGuid}'`);
    this.pickerData().source.deleteItem({ index, entityGuid });
  }

  goToLink(helpLink: string): void {
    this.log.a(`goToLink helpLink: '${helpLink}'`);
    window.open(helpLink, '_blank');
  }

  hasChild = (_: number, item: PickerTreeItem) => this.treeHelper.hasChild(_, item);



  /* Experiments */
  // This was a test, it worked, but felt much too complicated...
  settingsTest = toSignal(
    combineLatest([
      toObservable(this.config),
      toObservable(this.showItemEditButtons),
      toObservable(this.selectedItem)
    ]).pipe(
      map(([cnf, showButtons, sel]) => this.fieldsSettingsService.getFieldSettingsReplayed$(cnf.fieldName).pipe(
        map(sts => {
          const show = showButtons && !!sel;
          return {
            allowMultiValue: sts.AllowMultiValue,
            enableAddExisting: sts.EnableAddExisting,
            enableTextEntry: sts.EnableTextEntry,
            enableEdit: sts.EnableEdit && show && !sel?.noEdit,
            enableDelete: sts.EnableDelete && show && !sel?.noDelete,
            enableRemove: sts.EnableRemove && show,
            enableReselect: sts.EnableReselect,
            showAsTree: sts.PickerDisplayMode === 'tree',
          };
        }),
      )),
      switchAll(),
    ), { initialValue: {} as any });

}
