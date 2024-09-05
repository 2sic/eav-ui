import { ColumnApi, FilterChangedEvent, GridApi, GridOptions, GridReadyEvent, ICellRendererParams, RowClassParams, RowDragEvent, SortChangedEvent } from '@ag-grid-community/core';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef, MatDialogActions } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { RouterOutlet } from '@angular/router';
import { BehaviorSubject, Observable, combineLatest, forkJoin, map, of } from 'rxjs';
import { ContentType } from '../app-administration/models/content-type.model';
import { ContentTypesService } from '../app-administration/services/content-types.service';
import { GoToMetadata } from '../metadata';
import { GoToPermissions } from '../permissions/go-to-permissions';
import { defaultGridOptions } from '../shared/constants/default-grid-options.constants';
import { eavConstants } from '../shared/constants/eav.constants';
import { convertFormToUrl } from '../shared/helpers/url-prep.helper';
import { ItemAddIdentifier, EditForm, ItemEditIdentifier, ItemIdentifier, EditPrep } from '../shared/models/edit-form.model';
import { ContentTypeFieldsActionsComponent } from './content-type-fields-actions/content-type-fields-actions.component';
import { ContentTypeFieldsActionsParams } from './content-type-fields-actions/content-type-fields-actions.models';
import { ContentTypeFieldsInputTypeComponent } from './content-type-fields-input-type/content-type-fields-input-type.component';
import { ContentTypeFieldsInputTypeParams } from './content-type-fields-input-type/content-type-fields-input-type.models';
import { ContentTypeFieldsSpecialComponent } from './content-type-fields-special/content-type-fields-special.component';
import { ContentTypeFieldsTitleComponent } from './content-type-fields-title/content-type-fields-title.component';
import { ContentTypeFieldsTitleParams } from './content-type-fields-title/content-type-fields-title.models';
import { ContentTypeFieldsTypeComponent } from './content-type-fields-type/content-type-fields-type.component';
import { Field } from '../shared/fields/field.model';
import { ContentTypesFieldsService } from '../shared/fields/content-types-fields.service';
import { ShareOrInheritDialogComponent } from './share-or-inherit-dialog/share-or-inherit-dialog.component';
import { NgClass, AsyncPipe } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { ColumnDefinitions } from '../shared/ag-grid/column-definitions';
import { ToggleDebugDirective } from '../shared/directives/toggle-debug.directive';
import { SxcGridModule } from '../shared/modules/sxc-grid-module/sxc-grid.module';
import { transient } from '../core';
import { InputTypeHelpers } from '../shared/fields/input-type-helpers';
import { DialogRoutingService } from '../shared/routing/dialog-routing.service';

@Component({
  selector: 'app-content-type-fields',
  templateUrl: './content-type-fields.component.html',
  standalone: true,
  imports: [
    MatButtonModule,
    MatIconModule,
    RouterOutlet,
    NgClass,
    MatDialogActions,
    AsyncPipe,
    ToggleDebugDirective,
    SxcGridModule,
  ],
})
export class ContentTypeFieldsComponent implements OnInit, OnDestroy {

  #dialogRouter = transient(DialogRoutingService);
  
  contentType$ = new BehaviorSubject<ContentType>(undefined);
  fields$ = new BehaviorSubject<Field[]>(undefined);
  gridOptions = this.buildGridOptions();
  sortApplied = false;
  filterApplied = false;

  private gridApi: GridApi;
  private columnApi: ColumnApi;
  private rowDragSuppressed = false;
  private contentTypeStaticName = this.#dialogRouter.snapshot.paramMap.get('contentTypeStaticName');

  viewModel$: Observable<ContentTypeFieldsViewModel>;

  private contentTypesService = transient(ContentTypesService);
  private contentTypesFieldsService = transient(ContentTypesFieldsService);

  constructor(
    private dialogRef: MatDialogRef<ContentTypeFieldsComponent>,
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
  ) {
  }

  ngOnInit() {
    this.fetchFields();
    this.#dialogRouter.doOnDialogClosed(() => this.fetchFields());
    this.viewModel$ = combineLatest([
      this.contentType$, this.fields$
    ]).pipe(
      map(([contentType, fields]) => ({ contentType, fields }))
    );
  }

  ngOnDestroy() {
    this.contentType$.complete();
    this.fields$.complete();
  }

  closeDialog() {
    this.dialogRef.close();
  }

  onGridReady(params: GridReadyEvent) {
    this.gridApi = params.api;
    this.columnApi = params.columnApi;
  }

  onRowDragEnter(event: RowDragEvent) {
    this.gridApi.setEnableCellTextSelection(false);
  }

  onRowDragEnd(event: RowDragEvent) {
    this.gridApi.setSuppressRowDrag(true);
    const idArray = this.fields$.value.map(field => field.Id);
    this.contentTypesFieldsService.reOrder(idArray, this.contentType$.value).subscribe(() => {
      this.fetchFields(() => {
        this.gridApi.setEnableCellTextSelection(true);
        this.gridApi.setSuppressRowDrag(false);
      });
    });
  }

  onRowDragMove(event: RowDragEvent) {
    const movingNode = event.node;
    const overNode = event.overNode;
    if (!overNode) { return; }
    const rowNeedsToMove = movingNode !== overNode;
    if (rowNeedsToMove) {
      const movingData: Field = movingNode.data;
      const overData: Field = overNode.data;
      const newFields = [...this.fields$.value];
      const fromIndex = newFields.indexOf(movingData);
      const toIndex = newFields.indexOf(overData);
      this.moveInArray(newFields, fromIndex, toIndex);
      this.fields$.next(newFields);
      this.gridApi.clearFocusedCell();
    }
  }

  private moveInArray(arr: Field[], fromIndex: number, toIndex: number) {
    const element = arr[fromIndex];
    arr.splice(fromIndex, 1);
    arr.splice(toIndex, 0, element);
  }

  onSortChanged(params: SortChangedEvent) {
    const columnStates = this.columnApi.getColumnState();
    this.sortApplied = columnStates.some(state => state.sort != null);
    this.suppressRowDrag();
  }

  onFilterChanged(params: FilterChangedEvent) {
    const filterModel = this.gridApi.getFilterModel();
    const fieldsFiltered = Object.keys(filterModel);
    this.filterApplied = fieldsFiltered.length > 0;
    this.suppressRowDrag();
  }

  private suppressRowDrag() {
    const shouldSuppress = this.sortApplied || this.filterApplied;
    if (shouldSuppress && !this.rowDragSuppressed) {
      this.rowDragSuppressed = true;
      this.gridApi.setSuppressRowDrag(true);
    } else if (!shouldSuppress && this.rowDragSuppressed) {
      this.rowDragSuppressed = false;
      this.gridApi.setSuppressRowDrag(false);
    }
  }

  add() {
    this.#dialogRouter.navRelative([`add/${this.contentTypeStaticName}`]);
  }

  private nameCellRenderer(params: ICellRendererParams) {
    const currentField: Field = params.data;
    const inputType = currentField.InputType;

    if (InputTypeHelpers.endsPreviousGroup(inputType))
      return params.value;

    let isGroupOpen = false;
    for (const field of this.fields$.value) {
      if (InputTypeHelpers.isGroupStart(inputType)) {
        isGroupOpen = true;
        continue;
      }
      if (InputTypeHelpers.isGroupEnd(inputType)) {
        isGroupOpen = false;
        continue;
      }
      if (field.StaticName === currentField.StaticName)
        break;
    }

    return isGroupOpen ? `<span class="is-in-group">${params.value}</span>` : params.value;
  }

  private fetchFields(callback?: () => void) {
    const contentType$ = this.contentType$.value == null
      ? this.contentTypesService.retrieveContentType(this.contentTypeStaticName)
      : of(this.contentType$.value);
    const fields$ = this.contentTypesFieldsService.getFields(this.contentTypeStaticName);
    forkJoin([contentType$, fields$]).subscribe(([contentType, fields]) => {
      this.contentType$.next(contentType);
      this.fields$.next(fields);
      if (callback != null)
        callback();
    });
  }

  private editFieldMetadata(field: Field) {
    // 2023-11-10 @2dm #ConfigTypesFromBackend
    // https://github.com/2sic/2sxc/issues/3205
    // Keep old code in till 2024-01 for ref in case something breaks
    // console.warn('2dm - editFieldMetadata', field);
    // console.warn('2dm - editFieldMetadata', field.ConfigTypes);
    // const form: EditForm = {
    //   items: [
    //     this.createItemDefinition(field, 'All'),
    //     this.createItemDefinition(field, field.Type),
    //     this.createItemDefinition(field, field.InputType),
    //   ],
    // };

    // If this field is inherited and therefor has no own metadata, show a snackbar and exit
    if (field.SysSettings?.InheritMetadataOf) {
      if (!Object.keys(field.ConfigTypes).length) {
        this.snackBar.open('This field inherits all configuration so there is nothing to edit.', null, { duration: 3000 });
        return;
      }
      this.snackBar.open('This field inherits some configuration. Edit will only show configuration which is not inherited.', null, { duration: 5000 });
    }

    // if this field is shared/can-be-inherited, show warning so the user is aware of it
    if (field.SysSettings?.Share)
      this.snackBar.open('This field is shared, so changing it will affect all other fields inheriting it.', null, { duration: 5000 });

    const form: EditForm = {
      items: Object.keys(field.ConfigTypes).map((t) => this.createItemDefinition(field, t))
    };
    // console.warn('2dm - editFieldMetadata', field.ConfigTypes, form);
    const formUrl = convertFormToUrl(form);
    this.#dialogRouter.navRelative([`edit/${formUrl}`]);
  }

  private createItemDefinition(field: Field, metadataType: string): ItemAddIdentifier | ItemEditIdentifier {
    // The keys could start with an @ but may not, and in some cases we need it, others we don't
    const keyForMdLookup = metadataType.replace('@', '');
    const newItemTypeName = ('@' + metadataType).replace('@@', '@');

    // Is an item of this type already loaded? Then just edit it, otherwise request new as Metadata
    const existingMd = field.Metadata[keyForMdLookup];
    return existingMd != null
      ? EditPrep.editId(existingMd.Id) // if defined, return the entity-number to edit
      : {
        ...EditPrep.newMetadata(field.Id, newItemTypeName, eavConstants.metadata.attribute),
        Prefill: { Name: field.StaticName },
      };
  }


  private setTitle(field: Field) {
    this.snackBar.open('Setting title...');
    this.contentTypesFieldsService.setTitle(field, this.contentType$.value).subscribe(() => {
      this.snackBar.open('Title set', null, { duration: 2000 });
      this.fetchFields();
    });
  }

  private changeInputType(field: Field) {
    this.#dialogRouter.navRelative([`update/${this.contentTypeStaticName}/${field.Id}/inputType`]);
  }

  private rename(field: Field) {
    this.#dialogRouter.navRelative([`update/${this.contentTypeStaticName}/${field.Id}/name`]);
  }

  private delete(field: Field) {
    if (!confirm(`Are you sure you want to delete '${field.StaticName}' (${field.Id})?`)) { return; }
    this.snackBar.open('Deleting...');
    this.contentTypesFieldsService.delete(field, this.contentType$.value).subscribe(() => {
      this.snackBar.open('Deleted', null, { duration: 2000 });
      this.fetchFields();
    });
  }

  private openPermissions(field: Field) {
    this.#dialogRouter.navRelative([GoToPermissions.getUrlAttribute(field.Id)]);
  }

  private openImageConfiguration(field: Field) {
    console.log('2dm - openImageConfiguration', field);
    const imgConfig = field.imageConfiguration;
    if (imgConfig?.isRecommended != true)
      throw new Error('This field does not expect to have an image configuration');

    const itemIdentifier: ItemIdentifier = imgConfig.entityId
      ? EditPrep.editId(imgConfig.entityId)
      : EditPrep.newMetadata(field.Id, imgConfig.typeName, eavConstants.metadata.attribute);
    const formUrl = convertFormToUrl({ items: [itemIdentifier] });
    this.#dialogRouter.navRelative([`edit/${formUrl}`]);
  }

  private openMetadata(field: Field) {
    const url = GoToMetadata.getUrlAttribute(
      field.Id,
      `Metadata for Field: ${field.StaticName} (${field.Id})`,
    );
    this.#dialogRouter.navRelative([url]);
  }

  private shareOrInherit(field: Field) {
    const shareOrInheritDialogRef = this.dialog.open(ShareOrInheritDialogComponent, {
      autoFocus: false,
      width: '800px',
      data: field,
    });
    shareOrInheritDialogRef.afterClosed().subscribe(() => this.fetchFields());
  }

  //#region Grid Options

  private buildGridOptions(): GridOptions {
    const gridOptions: GridOptions = {
      ...defaultGridOptions,
      getRowClass(params: RowClassParams) {
        const field: Field = params.data;
        const rowClass: string[] = [];
        if (field.EditInfo.DisableSort) { rowClass.push('disable-row-drag'); }
        if (InputTypeHelpers.isGroupStart(field.InputType)) { rowClass.push('group-start-row'); }
        if (InputTypeHelpers.isGroupEnd(field.InputType)) { rowClass.push('group-end-row'); }
        return rowClass;
      },
      columnDefs: [
        {
          rowDrag: true,
          width: 18,
          cellClass: 'no-select no-padding no-outline'.split(' '),
        },
        {
          field: 'Title',
          width: 42,
          cellClass: 'secondary-action no-padding no-outline'.split(' '),
          valueGetter: (params) => {
            const field: Field = params.data;
            return field.IsTitle;
          },
          cellRenderer: ContentTypeFieldsTitleComponent,
          cellRendererParams: (() => {
            const params: ContentTypeFieldsTitleParams = {
              onSetTitle: (field) => this.setTitle(field),
            };
            return params;
          })(),
        },
        {
          ...ColumnDefinitions.TextWide,
          headerName: 'Name',
          field: 'StaticName',
          onCellClicked: (params) => {
            const field: Field = params.data;
            this.editFieldMetadata(field);
          },
          cellRenderer: (params: ICellRendererParams) => this.nameCellRenderer(params),
        },
        {
          field: 'Type',
          width: 70,
          headerClass: 'dense',
          cellClass: 'no-outline',
          sortable: true,
          filter: 'agTextColumnFilter',
          valueGetter: (params) => {
            const field: Field = params.data;
            return field.Type;
          },
          cellRenderer: ContentTypeFieldsTypeComponent,
        },
        {
          headerName: 'Input',
          field: 'InputType',
          width: 160,
          cellClass: (params) => {
            const field: Field = params.data;
            return `${field.EditInfo.DisableEdit ? 'no-outline no-padding' : 'secondary-action no-padding'}`.split(' ');
          },
          sortable: true,
          filter: 'agTextColumnFilter',
          valueGetter: (params) => {
            const field: Field = params.data;
            const inputType = field.InputType.substring(field.InputType.indexOf('-') + 1);
            return inputType;
          },
          cellRenderer: ContentTypeFieldsInputTypeComponent,
          cellRendererParams: (() => {
            const params: ContentTypeFieldsInputTypeParams = {
              onChangeInputType: (field) => this.changeInputType(field),
            };
            return params;
          })(),
        },
        {
          field: 'Label',
          flex: 2,
          minWidth: 250,
          cellClass: 'no-outline',
          sortable: true,
          filter: 'agTextColumnFilter',
          valueGetter: (params) => {
            const field: Field = params.data;
            return field.Metadata?.All?.Name;
          },
        },
        {
          field: 'Special',
          width: 66,
          headerClass: 'dense',
          cellClass: 'no-outline',
          cellRenderer: ContentTypeFieldsSpecialComponent,
        },
        {
          field: 'Notes',
          flex: 2,
          minWidth: 250,
          cellClass: 'no-outline',
          sortable: true,
          filter: 'agTextColumnFilter',
          valueGetter: (params) => {
            const field: Field = params.data;
            return field.Metadata?.All?.Notes;
          },
        },
        {
          ...ColumnDefinitions.ActionsPinnedRight5,
          cellRenderer: ContentTypeFieldsActionsComponent,
          cellRendererParams: (() => ({
            do: (verb, field) => {
              switch (verb) {
                case 'rename': this.rename(field); break;
                case 'delete': this.delete(field); break;
                case 'permissions': this.openPermissions(field); break;
                case 'metadata': this.openMetadata(field); break;
                case 'shareOrInherit': this.shareOrInherit(field); break;
                case 'image': this.openImageConfiguration(field); break;
              }
            }
          } satisfies ContentTypeFieldsActionsParams))(),
        },
      ],
    };
    return gridOptions;
  }

  //#endregion
}

interface ContentTypeFieldsViewModel {
  contentType: ContentType;
  fields: Field[];
}
