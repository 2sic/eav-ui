import { Component, ElementRef, OnDestroy, OnInit, computed, input, signal, viewChild } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteSelectedEvent, MatAutocompleteModule } from '@angular/material/autocomplete';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { PickerItem } from 'projects/edit-types';
import { GlobalConfigService } from '../../../../shared/store/ngrx-data';
import { MatTreeModule } from '@angular/material/tree';
import { MatOptionModule } from '@angular/material/core';
import { SharedComponentsModule } from '../../../../../shared/shared-components.module';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { ExtendedModule } from '@angular/flex-layout/extended';
import { NgClass, AsyncPipe } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { EavLogger } from 'projects/eav-ui/src/app/shared/logging/eav-logger';
import { PickerTreeDataHelper } from '../picker-tree/picker-tree-data-helper';
import { PickerTreeDataService } from '../picker-tree/picker-tree-data-service';
import { messagePickerItem } from '../adapters/data-adapter-base';
import { PickerTreeItem } from '../models/picker-tree.models';
import { PickerIconHelpComponent } from "../picker-icon-help/picker-icon-help.component";
import { PickerIconInfoComponent } from "../picker-icon-info/picker-icon-info.component";
import { ClickStopPropagationDirective } from 'projects/eav-ui/src/app/shared/directives/click-stop-propagation.directive';
import { ControlHelpers } from '../../../../shared/helpers/control.helpers';
import { toSignal } from '@angular/core/rxjs-interop';
import { PickerPartBaseComponent } from '../picker-part-base.component';
import { RxHelpers } from 'projects/eav-ui/src/app/shared/rxJs/rx.helpers';

const logThis = false;
/** log each detail, eg. item-is-disabled (separate logger) */
const logEachItemChecks = false;
const nameOfThis = 'PickerSearchComponent';

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
  ]
})
export class PickerSearchComponent extends PickerPartBaseComponent implements OnInit, OnDestroy {
  //#region Inputs

  /** Determine if the input field shows the selected items. eg. not when in dialog where it's just a search-box */
  showSelectedItem = input.required<boolean>();

  /** Determine if edit buttons are possible, eg. not in preview */
  showItemEditButtons = input.required<boolean>();

  //#endregion

  /** The input field for the search */
  autocomplete = viewChild.required<ElementRef<HTMLInputElement>>('autocomplete');

  private newValue: string = null;

  /** Currently selected 1 item, as this input will only ever show 1 and it needs to know if certain edit buttons should be shown. */
  public selectedItem = computed(() => this.pickerData().selectedOne(), { equal: RxHelpers.objectsEqual });

  /** special trigger to recalculate filtered items; not ideal, should happen automatically */
  private reFilter = signal(false);

  public filteredItems = computed(() => {
    const _ = this.reFilter(); // just make a dependency
    const all = this.pickerData().source.optionsOrHints();
    const filterInDom = this.autocomplete()?.nativeElement.value;
    const filter = filterInDom?.toLocaleLowerCase();

    const result = !filter
      ? all
      : all.filter(oItem => ((oItem.label ? oItem.label : oItem.value) ?? '').toLocaleLowerCase().includes(filter));

    // If the list is empty, show a message about this.
    return result.length > 0
      ? result
      : [messagePickerItem(this.translate, 'Fields.Picker.FilterNoResults', { search: filterInDom })];
  });

  /** Special log which would fire a lot for each item doing disabled checks etc. */
  private logItemChecks = new EavLogger('PickerSearchComponent-ItemChecks', logEachItemChecks);

  /** Debug status for UI, mainly to show "add-null" button */
  debugEnabled = toSignal(this.globalConfigService.getDebugEnabled$(), { initialValue: false });

  /** Current applicable settings like "enableEdit" etc. */
  settings = computed(() => {
    const selected = this.selectedItem();
    const show = this.showItemEditButtons() && !!selected;
    const sts = this.fieldState.settings();
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
  }, { equal: RxHelpers.objectsEqual });

  /**
   * The tree helper which is used by the tree display.
   * Will only be initialized if we're really showing a tree.
   */
  treeHelper: PickerTreeDataHelper;

  constructor(
    private translate: TranslateService,
    private globalConfigService: GlobalConfigService,
    private treeDataService: PickerTreeDataService,
  ) {
    super(new EavLogger(nameOfThis, logThis));
  }

  ngOnInit(): void {
    // process formulas on options...?
    // TODO: @2dm - maybe there is even a more elegant way to do this
    const enableFormulas = false;
    if (enableFormulas) {
      // this.fieldsSettingsService.processPickerItems$(config.fieldName, source.optionsOrHints$)
    }

    const fieldSettings = this.fieldState.settings;
    if (fieldSettings().PickerDisplayMode === 'tree') {
      // Setup Tree Helper - but should only happen, if we're really doing trees
      // Only doing this the first time, as these settings are not expected to change
      this.treeDataService.init(fieldSettings, this.pickerData().source.optionsOrHints);
      this.treeHelper = this.treeDataService.treeHelper;
    }
  }

  displaySelected(item: PickerItem): string {
    return this.showSelectedItem() ? (item?.label ?? '') : '';
  }

  // 2024-04-30 2dm: seems this is always a string, will simplify the code
  displayFn(value: string /* | string[] | PickerItem */): string {
    const selectedItem = this.selectedItem();
    this.logItemChecks.add(`displayFn: value: '${value}'; selectedItem: `, selectedItem);
    // and probably clean up if it's stable for a few days
    if (value == null) return '';
    let returnValue = this.pickerData().source.optionsOrHints().find(ae => ae.value == value)?.label;

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
    ControlHelpers.markControlTouched(this.fieldState.control);
  }

  fetchEntities(): void {
    this.pickerData().source.fetchItems();
  }

  filterSelectionList(): void {
    this.reFilter.update(x => !x);
  }

  /**
   * Event triggered when opening the auto-complete / search
   */
  onOpened(isTreeDisplayMode: boolean): void {
    const domElement = this.autocomplete().nativeElement;
    this.log.a(`onOpened: isTreeDisplayMode ${isTreeDisplayMode}; domValue: '${domElement.value}'`);
    // flush the input so the user can use it to search, otherwise the list is filtered
    domElement.value = '';
    this.reFilter.update(x => !x);
    // If tree, we need to blur so tree reacts to the first click, otherwise the user must click 2x
    if (isTreeDisplayMode)
      domElement.blur();
  }

  onClosed(): void {
    const selectedItems = this.selectedItems();
    const selectedItem = this.selectedItem();
    const nativeElement = this.autocomplete().nativeElement;
    this.log.a('onClosed', [selectedItems, selectedItem]);
    if (this.showSelectedItem()) {
      // @SDV - improve this
      if (this.newValue && this.newValue != selectedItem?.value) {
        //this.autocompleteRef.nativeElement.value = this.availableItems$.value?.find(ae => ae.Value == this.newValue)?.Text;
      }
      else if (selectedItem && selectedItems.length < 2)
        nativeElement.value = selectedItem.label;
    } else {
      // @SDV - improve this
      nativeElement.value = '';
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
      this.autocomplete().nativeElement.blur();
    });
  }

  getPlaceholder(): string {
    const allOptions = this.pickerData().source.optionsOrHints();
    var placeholder = allOptions.length > 0
      ? this.translate.instant('Fields.Picker.Search')
      : this.translate.instant('Fields.Picker.QueryNoItems');
    this.logItemChecks.a(`getPlaceholder error: result '${placeholder}'`, allOptions);
    return placeholder;
  }

  toggleFreeText(disabled: boolean): void {
    this.log.a(`toggleFreeText ${disabled}`);
    if (disabled) return;
    this.pickerData().state.toggleFreeTextMode();
  }

  insertNull(): void {
    this.log.a('insertNull');
    this.pickerData().state.addSelected(null);
  }

  isOptionDisabled(value: string): boolean {
    const selected = this.selectedItems();
    const isSelected = selected.some(entity => entity.value === value);
    this.logItemChecks.a(`sOptionDisabled value: '${value}'; result: ${isSelected}`, selected);
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

}
