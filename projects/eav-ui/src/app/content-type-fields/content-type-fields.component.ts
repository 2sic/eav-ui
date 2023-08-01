// tslint:disable-next-line:max-line-length
import { ColumnApi, FilterChangedEvent, GridApi, GridOptions, GridReadyEvent, ICellRendererParams, RowClassParams, RowDragEvent, SortChangedEvent } from '@ag-grid-community/core';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatLegacyDialogRef as MatDialogRef } from '@angular/material/legacy-dialog';
import { MatLegacySnackBar as MatSnackBar } from '@angular/material/legacy-snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { BehaviorSubject, Observable, combineLatest, forkJoin, map, of } from 'rxjs';
import { ContentType } from '../app-administration/models/content-type.model';
import { ContentTypesService } from '../app-administration/services/content-types.service';
import { GoToMetadata } from '../metadata';
import { GoToPermissions } from '../permissions/go-to-permissions';
import { BaseComponent } from '../shared/components/base-component/base.component';
import { defaultGridOptions } from '../shared/constants/default-grid-options.constants';
import { eavConstants } from '../shared/constants/eav.constants';
import { convertFormToUrl } from '../shared/helpers/url-prep.helper';
import { ItemAddIdentifier, EditForm, ItemEditIdentifier } from '../shared/models/edit-form.model';
import { InputTypeConstants } from './constants/input-type.constants';
import { ContentTypeFieldsActionsComponent } from './content-type-fields-actions/content-type-fields-actions.component';
import { ContentTypeFieldsActionsParams } from './content-type-fields-actions/content-type-fields-actions.models';
import { ContentTypeFieldsInputTypeComponent } from './content-type-fields-input-type/content-type-fields-input-type.component';
// tslint:disable-next-line:max-line-length
import { ContentTypeFieldsInputTypeParams } from './content-type-fields-input-type/content-type-fields-input-type.models';
import { ContentTypeFieldsSpecialComponent } from './content-type-fields-special/content-type-fields-special.component';
import { ContentTypeFieldsTitleComponent } from './content-type-fields-title/content-type-fields-title.component';
import { ContentTypeFieldsTitleParams } from './content-type-fields-title/content-type-fields-title.models';
import { ContentTypeFieldsTypeComponent } from './content-type-fields-type/content-type-fields-type.component';
import { Field } from './models/field.model';
import { ContentTypesFieldsService } from './services/content-types-fields.service';
import { EmptyFieldHelpers } from '../edit/form/fields/empty/empty-field-helpers';

@Component({
  selector: 'app-content-type-fields',
  templateUrl: './content-type-fields.component.html',
  styleUrls: ['./content-type-fields.component.scss'],
})
export class ContentTypeFieldsComponent extends BaseComponent implements OnInit, OnDestroy {
  contentType$ = new BehaviorSubject<ContentType>(undefined);
  fields$ = new BehaviorSubject<Field[]>(undefined);
  gridOptions = this.buildGridOptions();
  sortApplied = false;
  filterApplied = false;

  private gridApi: GridApi;
  private columnApi: ColumnApi;
  private rowDragSuppressed = false;
  private contentTypeStaticName = this.route.snapshot.paramMap.get('contentTypeStaticName');

  viewModel$: Observable<ContentTypeFieldsViewModel>;


  constructor(
    protected router: Router,
    protected route: ActivatedRoute,
    private dialogRef: MatDialogRef<ContentTypeFieldsComponent>,
    private contentTypesService: ContentTypesService,
    private contentTypesFieldsService: ContentTypesFieldsService,
    private snackBar: MatSnackBar,
  ) {
    super(router, route);
   }

  ngOnInit() {
    this.fetchFields();
    this.subscription.add(this.refreshOnChildClosedShallow().subscribe(() => { this.fetchFields(); }));
    this.viewModel$ = combineLatest([
      this.contentType$, this.fields$
    ]).pipe(
      map(([contentType, fields]) => ({ contentType, fields }))
    );
  }

  ngOnDestroy() {
    this.contentType$.complete();
    this.fields$.complete();
    super.ngOnDestroy();
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
    this.router.navigate([`add/${this.contentTypeStaticName}`], { relativeTo: this.route });
  }

  private nameCellRenderer(params: ICellRendererParams) {
    const currentField: Field = params.data;
    const inputType = currentField.InputType;
    // const empties: string[] = [InputTypeConstants.EmptyDefault, InputTypeConstants.EmptyEnd];
    // if (empties.includes(currentField.InputType)) {
    if (EmptyFieldHelpers.endsPreviousGroup(inputType))
      return params.value;

    let isGroupOpen = false;
    for (const field of this.fields$.value) {
      if (EmptyFieldHelpers.isGroupStart(inputType)) {
        isGroupOpen = true;
        continue;
      }
      if (EmptyFieldHelpers.isGroupEnd(inputType)) {
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
      if (callback != null) { callback(); }
    });
  }

  private editFieldMetadata(field: Field) {
    const form: EditForm = {
      items: [
        this.createItemDefinition(field, 'All'),
        this.createItemDefinition(field, field.Type),
        this.createItemDefinition(field, field.InputType),
      ],
    };
    const formUrl = convertFormToUrl(form);
    this.router.navigate([`edit/${formUrl}`], { relativeTo: this.route });
  }

  private createItemDefinition(field: Field, metadataType: string): ItemAddIdentifier | ItemEditIdentifier {
    return field.Metadata[metadataType] != null
      ? { EntityId: field.Metadata[metadataType].Id } // if defined, return the entity-number to edit
      : {
        ContentTypeName: '@' + metadataType, // otherwise the content type for new-assignment
        For: {
          Target: eavConstants.metadata.attribute.target,
          TargetType: eavConstants.metadata.attribute.targetType,
          Number: field.Id,
        },
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
    this.router.navigate([`update/${this.contentTypeStaticName}/${field.Id}/inputType`], { relativeTo: this.route });
  }

  private rename(field: Field) {
    this.router.navigate([`update/${this.contentTypeStaticName}/${field.Id}/name`], { relativeTo: this.route });
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
    this.router.navigate([GoToPermissions.getUrlAttribute(field.Id)], { relativeTo: this.route });
  }

  private openMetadata(field: Field) {
    const url = GoToMetadata.getUrlAttribute(
      field.Id,
      `Metadata for Field: ${field.StaticName} (${field.Id})`,
    );
    this.router.navigate([url], { relativeTo: this.route });
  }

  private buildGridOptions(): GridOptions {
    const gridOptions: GridOptions = {
      ...defaultGridOptions,
      getRowClass(params: RowClassParams) {
        const field: Field = params.data;
        const rowClass: string[] = [];
        if (field.EditInfo.ReadOnly) { rowClass.push('disable-row-drag'); }
        if (EmptyFieldHelpers.isGroupStart(field.InputType)) { rowClass.push('group-start-row'); }
        if (EmptyFieldHelpers.isGroupEnd(field.InputType)) { rowClass.push('group-end-row'); }
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
          field: 'Name',
          flex: 2,
          minWidth: 250,
          cellClass: 'primary-action highlight'.split(' '),
          sortable: true,
          filter: 'agTextColumnFilter',
          onCellClicked: (params) => {
            const field: Field = params.data;
            this.editFieldMetadata(field);
          },
          cellRenderer: (params: ICellRendererParams) => this.nameCellRenderer(params),
          valueGetter: (params) => {
            const field: Field = params.data;
            return field.StaticName;
          },
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
            return `${field.EditInfo.ReadOnly ? 'no-outline no-padding' : 'secondary-action no-padding'}`.split(' ');
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
          width: 122,
          cellClass: 'secondary-action no-padding'.split(' '),
          pinned: 'right',
          cellRenderer: ContentTypeFieldsActionsComponent,
          cellRendererParams: (() => {
            const params: ContentTypeFieldsActionsParams = {
              onRename: (field) => this.rename(field),
              onDelete: (field) => this.delete(field),
              onOpenPermissions: (field) => this.openPermissions(field),
              onOpenMetadata: (field) => this.openMetadata(field),
            };
            return params;
          })(),
        },
      ],
    };
    return gridOptions;
  }
}

interface ContentTypeFieldsViewModel {
  contentType: ContentType;
  fields: Field[];
}