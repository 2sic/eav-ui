import { Component, ElementRef, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { AbstractControl, FormGroup } from '@angular/forms';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { TranslateService } from '@ngx-translate/core';
import { PickerItem } from 'projects/edit-types';
import { BehaviorSubject, combineLatest, distinctUntilChanged, map, Observable, take, tap } from 'rxjs';
import { GeneralHelpers } from '../../../../shared/helpers';
import { FieldsSettingsService } from '../../../../shared/services';
import { GlobalConfigService } from '../../../../shared/store/ngrx-data';
import { PickerSearchViewModel } from './picker-search.models';
import { FieldConfigSet, FieldControlConfig } from '../../../builder/fields-builder/field-config-set.model';
import { Field } from '../../../builder/fields-builder/field.model';
import { BaseSubsinkComponent } from 'projects/eav-ui/src/app/shared/components/base-subsink-component/base-subsink.component';
import { PickerData } from '../picker-data';

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

  /** Needed later for tree implementation testing */
  // private pickerTreeConfiguration: UiPickerModeTree;
  // dataSource: any;

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

    this.availableItems$ = source.availableItems$;
    this.selectedItems$ = this.pickerData.selectedItems$;//.pipe(tap(si => console.log("SDV selected items", si[0])));

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
        // console.log("SDV selected item", selectedItem);

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

    /** Needed later for tree implementation testing */
    // this.subscription.add(settings$.subscribe(settings => {
    //   if (!settings.PickerTreeConfiguration) return;
    //   this.pickerTreeConfiguration = settings.PickerTreeConfiguration;
    //   const filteredData = TREE_DATA.filter(x => x.parent.length == 0);
    //   this.dataSource = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener);
    //   this.dataSource.data = filteredData;
    // }));
  }

  ngOnDestroy(): void {
    super.ngOnDestroy();
  }

  // TODO: @SDV - Simplify this
  displayFn(value: string | string[] | PickerItem): string {
    let returnValue = '';
    if (value) {
      if (typeof value === 'string')
        returnValue = this.availableItems$.value?.find(ae => ae.Value == value)?.Text;
      else if (Array.isArray(value)) {
        if (typeof value[0] === 'string') {
          if (value.length == 35) {
            const guid = value.join('');
            returnValue = this.availableItems$.value?.find(ae => ae.Value == guid)?.Text;
          } else if (value.length == 36) {
            const guid = value[value.length - 1];
            returnValue = this.availableItems$.value?.find(ae => ae.Value == guid)?.Text;
          } else {
            returnValue = this.availableItems$.value?.find(ae => ae.Value == value[0])?.Text;
          }
        } else {
          returnValue = (value[0] as PickerItem)?.Text;
        }
      }
      else
        returnValue = (value as PickerItem)?.Text;
    }
    if (!returnValue) {
      if (this.selectedItem$.value?.Value == value) {
        returnValue = this.selectedItem$.value.Text;
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
    this.pickerData.source.fetchItems(false);
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
      if (this.newValue && this.newValue != selectedItem.Value) {} //this.autocompleteRef.nativeElement.value = this.availableItems$.value?.find(ae => ae.Value == this.newValue)?.Text;
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
    // TODO: @SDV - This is needed so after choosing option element is not focused (it gets focused by default so if blur is outside of setTimeout it will happen before refocus)
    setTimeout(() => {
      this.autocompleteRef.nativeElement.blur();
    });
  }

  getPlaceholder(availableEntities: PickerItem[], error: string): string {
    if (availableEntities == null || availableEntities.length <= 1) {
      return this.translate.instant('Fields.Entity.Loading');
    }
    if (availableEntities.length > 1) {
      return this.translate.instant('Fields.Entity.Search');
    }
    if (error) {
      return error;
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

  /** Needed later for tree implementation testing */
  // isOptionUnpickable(item: WIPDataSourceTreeItem, selectedEntities: WIPDataSourceItem[], enableReselect: boolean, pickerTreeConfiguration: UiPickerModeTree): boolean {
  //   const isUnpickableBySelection = enableReselect ? false : selectedEntities.some(entity => entity.Value === item.Value);
  //   const isRootUnpickableByConfiguration = pickerTreeConfiguration?.TreeAllowSelectRoot ? false : item.Children?.length > 0 && item.Parent?.length === 0;
  //   const isBranchUnpickableByConfiguration = pickerTreeConfiguration?.TreeAllowSelectBranch ? false : item.Children?.length > 0 && item.Parent?.length > 0;
  //   const isLeafUnpickableByConfiguration = pickerTreeConfiguration?.TreeAllowSelectLeaves ? false : item.Children?.length === 0;
  //   return isUnpickableBySelection || isRootUnpickableByConfiguration || isBranchUnpickableByConfiguration || isLeafUnpickableByConfiguration;
  // }

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
  // treeControl = new FlatTreeControl<WIPDataSourceTreeItem>(
  //   node => node.Level,
  //   node => node.Expandable,
  // );

  // treeFlattener: MatTreeFlattener<TreeNode, WIPDataSourceTreeItem> = new MatTreeFlattener(
  //   (node, Level) => {
  //     return {
  //       Level: Level,
  //       Expandable: !!(node as TreeNode)[this.pickerTreeConfiguration?.TreeParentChildRefField] && (node as TreeNode)[this.pickerTreeConfiguration?.TreeParentChildRefField].length > 0,
  //       Value: node.Guid,
  //       Text: node.Title,
  //       Parent: (node as TreeNode)[this.pickerTreeConfiguration?.TreeChildParentRefField],
  //       Children: (node as TreeNode)[this.pickerTreeConfiguration?.TreeParentChildRefField],
  //     };
  //   },
  //   (node) => { return node.Level; },
  //   (node) => { return node.Expandable; },
  //   (node) => {
  //     return (node as TreeNode)[this.pickerTreeConfiguration?.TreeParentChildRefField].map((x: any) => {
  //       const child = TREE_DATA.find(y => (y as any)[this.pickerTreeConfiguration?.TreeChildIdField] == (x as any)[this.pickerTreeConfiguration?.TreeChildIdField]);
  //       return child;
  //     });
  //   },
  // );

  // hasChild = (_: number, node: WIPDataSourceTreeItem) => node.Expandable;
}

/** Needed later for tree implementation testing */
// interface TreeNode {
//   // children: IdNode[];
//   // parent: IdNode[];
//   // name: string;
//   // Id: number;
//   // Title: string;
//   // Guid: string;
//   // Modified: string;
//   // Created: string;
//   [key: string]: any;
// }

// interface IdNode {
//   Id: number;
//   Title: string;
// }

// let TREE_DATA: TreeNode[] = [
//   {
//     children: [
//       {
//         Id: 23578,
//         Title: "bmw 640d"
//       },
//       {
//         Id: 23577,
//         Title: "bmw x6"
//       },
//       {
//         Id: 23576,
//         Title: "mazda miata"
//       },
//       {
//         Id: 23575,
//         Title: "subaru impreza"
//       }
//     ],
//     parent: [
//       {
//         Id: 23574,
//         Title: "vehicles"
//       }
//     ],
//     name: "cars",
//     Id: 23571,
//     Guid: "76410a68-15f1-4d83-9963-a4771428edff",
//     Title: "cars",
//     Modified: "2023-10-26T04:06:37Z",
//     Created: "2023-10-26T04:02:14Z"
//   },
//   {
//     children: [
//       {
//         Id: 23580,
//         Title: "ducati multistrada"
//       },
//       {
//         Id: 23579,
//         Title: "honda cbr650"
//       }
//     ],
//     parent: [
//       {
//         Id: 23574,
//         Title: "vehicles"
//       }
//     ],
//     name: "bikes",
//     Id: 23572,
//     Guid: "13255287-373e-4528-87e0-2f49f33902ea",
//     Title: "bikes",
//     Modified: "2023-10-26T04:06:59Z",
//     Created: "2023-10-26T04:02:20Z"
//   },
//   {
//     children: [
//       {
//         Id: 23581,
//         Title: "apex marine 818"
//       }
//     ],
//     parent: [
//       {
//         Id: 23574,
//         Title: "vehicles"
//       }
//     ],
//     name: "boats",
//     Id: 23573,
//     Guid: "478619bf-e1ee-47bd-9ed5-71d79a813e01",
//     Title: "boats",
//     Modified: "2023-10-26T04:07:12Z",
//     Created: "2023-10-26T04:02:33Z"
//   },
//   {
//     children: [
//       {
//         Id: 23572,
//         Title: "bikes"
//       },
//       {
//         Id: 23573,
//         Title: "boats"
//       },
//       {
//         Id: 23571,
//         Title: "cars"
//       }
//     ],
//     parent: [],
//     name: "vehicles",
//     Id: 23574,
//     Guid: "95017780-7101-45e2-8a67-124482705545",
//     Title: "vehicles",
//     Modified: "2023-10-26T04:03:08Z",
//     Created: "2023-10-26T04:03:08Z"
//   },
//   {
//     children: [],
//     parent: [
//       {
//         Id: 23571,
//         Title: "cars"
//       }
//     ],
//     name: "subaru impreza",
//     Id: 23575,
//     Guid: "d448ef39-9e3b-4f18-a15c-7a67603793c3",
//     Title: "subaru impreza",
//     Modified: "2023-10-26T04:03:36Z",
//     Created: "2023-10-26T04:03:36Z"
//   },
//   {
//     children: [],
//     parent: [
//       {
//         Id: 23571,
//         Title: "cars"
//       }
//     ],
//     name: "mazda miata",
//     Id: 23576,
//     Guid: "fd4f49b9-60f5-43e9-b8e0-3dcc940846e3",
//     Title: "mazda miata",
//     Modified: "2023-10-26T04:03:46Z",
//     Created: "2023-10-26T04:03:46Z"
//   },
//   {
//     children: [],
//     parent: [
//       {
//         Id: 23571,
//         Title: "cars"
//       }
//     ],
//     name: "bmw x6",
//     Id: 23577,
//     Guid: "d536cc96-70ec-43a8-becc-ea92da9a43c1",
//     Title: "bmw x6",
//     Modified: "2023-10-26T04:04:02Z",
//     Created: "2023-10-26T04:04:02Z"
//   },
//   {
//     children: [],
//     parent: [
//       {
//         Id: 23571,
//         Title: "cars"
//       }
//     ],
//     name: "bmw 640d",
//     Id: 23578,
//     Guid: "b5cc9c75-050d-45ac-ba66-65015b2e3b3e",
//     Title: "bmw 640d",
//     Modified: "2023-10-26T04:04:16Z",
//     Created: "2023-10-26T04:04:16Z"
//   },
//   {
//     children: [],
//     parent: [
//       {
//         Id: 23572,
//         Title: "bikes"
//       }
//     ],
//     name: "honda cbr650",
//     Id: 23579,
//     Guid: "82de3883-aaa4-4b0e-a713-8b75a3685807",
//     Title: "honda cbr650",
//     Modified: "2023-10-26T04:04:37Z",
//     Created: "2023-10-26T04:04:37Z"
//   },
//   {
//     children: [],
//     parent: [
//       {
//         Id: 23572,
//         Title: "bikes"
//       }
//     ],
//     name: "ducati multistrada",
//     Id: 23580,
//     Guid: "44cd9147-5962-4644-a330-f1e342879aa7",
//     Title: "ducati multistrada",
//     Modified: "2023-10-26T04:04:52Z",
//     Created: "2023-10-26T04:04:52Z"
//   },
//   {
//     children: [],
//     parent: [
//       {
//         Id: 23573,
//         Title: "boats"
//       }
//     ],
//     name: "apex marine 818",
//     Id: 23581,
//     Guid: "fbd72a52-4d97-4f93-a093-ef273888a902",
//     Title: "apex marine 818",
//     Modified: "2023-10-26T04:06:00Z",
//     Created: "2023-10-26T04:06:00Z"
//   }
// ];