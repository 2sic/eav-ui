// tslint:disable-next-line:max-line-length
import { AllCommunityModules, FilterChangedEvent, GridApi, GridOptions, GridReadyEvent, ICellRendererParams, RowClassParams, RowDragEvent, SortChangedEvent } from '@ag-grid-community/all-modules';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { BehaviorSubject, forkJoin, of, Subscription } from 'rxjs';
import { filter, map, pairwise, startWith } from 'rxjs/operators';
import { ContentType } from '../app-administration/models/content-type.model';
import { ContentTypesService } from '../app-administration/services/content-types.service';
import { GoToMetadata } from '../metadata';
import { GoToPermissions } from '../permissions/go-to-permissions';
import { defaultGridOptions } from '../shared/constants/default-grid-options.constants';
import { eavConstants } from '../shared/constants/eav.constants';
import { convertFormToUrl } from '../shared/helpers/url-prep.helper';
import { AddItem, EditForm, EditItem } from '../shared/models/edit-form.model';
import { ContentTypeFieldsActionsComponent } from './ag-grid-components/content-type-fields-actions/content-type-fields-actions.component';
import { ContentTypeFieldsActionsParams } from './ag-grid-components/content-type-fields-actions/content-type-fields-actions.models';
import { ContentTypeFieldsInputTypeComponent } from './ag-grid-components/content-type-fields-input-type/content-type-fields-input-type.component';
// tslint:disable-next-line:max-line-length
import { ContentTypeFieldsInputTypeParams } from './ag-grid-components/content-type-fields-input-type/content-type-fields-input-type.models';
import { ContentTypeFieldsSpecialComponent } from './ag-grid-components/content-type-fields-special/content-type-fields-special.component';
import { ContentTypeFieldsTitleComponent } from './ag-grid-components/content-type-fields-title/content-type-fields-title.component';
import { ContentTypeFieldsTitleParams } from './ag-grid-components/content-type-fields-title/content-type-fields-title.models';
import { ContentTypeFieldsTypeComponent } from './ag-grid-components/content-type-fields-type/content-type-fields-type.component';
import { InputTypeConstants } from './constants/input-type.constants';
import { Field } from './models/field.model';
import { ContentTypesFieldsService } from './services/content-types-fields.service';

@Component({
  selector: 'app-content-type-fields',
  templateUrl: './content-type-fields.component.html',
  styleUrls: ['./content-type-fields.component.scss'],
})
export class ContentTypeFieldsComponent implements OnInit, OnDestroy {
  contentType$ = new BehaviorSubject<ContentType>(null);
  fields$ = new BehaviorSubject<Field[]>(null);

  modules = AllCommunityModules;
  gridOptions: GridOptions = {
    ...defaultGridOptions,
    getRowClass(params: RowClassParams) {
      const field: Field = params.data;
      const rowClass: string[] = [];
      if (field.EditInfo.ReadOnly) { rowClass.push('disable-row-drag'); }
      if (field.InputType === InputTypeConstants.EmptyDefault) { rowClass.push('group-start-row'); }
      if (field.InputType === InputTypeConstants.EmptyEnd) { rowClass.push('group-end-row'); }
      return rowClass.join(' ');
    },
    frameworkComponents: {
      contentTypeFieldsTitleComponent: ContentTypeFieldsTitleComponent,
      contentTypeFieldsTypeComponent: ContentTypeFieldsTypeComponent,
      contentTypeFieldsInputTypeComponent: ContentTypeFieldsInputTypeComponent,
      contentTypeFieldsSpecialComponent: ContentTypeFieldsSpecialComponent,
      contentTypeFieldsActionsComponent: ContentTypeFieldsActionsComponent,
    },
    columnDefs: [
      { rowDrag: true, width: 18, cellClass: 'no-select no-padding no-outline' },
      {
        field: 'Title', width: 42, cellClass: 'secondary-action no-padding no-outline',
        cellRenderer: 'contentTypeFieldsTitleComponent', valueGetter: (params) => (params.data as Field).IsTitle,
        cellRendererParams: {
          onSetTitle: (field) => this.setTitle(field),
        } as ContentTypeFieldsTitleParams,
      },
      {
        field: 'Name', flex: 2, minWidth: 250, cellClass: 'primary-action highlight',
        sortable: true, filter: 'agTextColumnFilter', onCellClicked: (params) => this.editFieldMetadata(params.data as Field),
        cellRenderer: (params: ICellRendererParams) => this.nameCellRenderer(params),
        valueGetter: (params) => (params.data as Field).StaticName,
      },
      {
        field: 'Type', width: 70, headerClass: 'dense', cellClass: 'no-outline', sortable: true,
        filter: 'agTextColumnFilter', cellRenderer: 'contentTypeFieldsTypeComponent',
        valueGetter: (params) => (params.data as Field).Type,
      },
      {
        headerName: 'Input', field: 'InputType', width: 160,
        cellClass: (params) => (params.data as Field).EditInfo.ReadOnly ? 'no-outline no-padding' : 'secondary-action no-padding',
        sortable: true, filter: 'agTextColumnFilter', cellRenderer: 'contentTypeFieldsInputTypeComponent',
        valueGetter: (params) => this.inputTypeValueGetter(params.data as Field),
        cellRendererParams: {
          onChangeInputType: (field) => this.changeInputType(field),
        } as ContentTypeFieldsInputTypeParams,
      },
      {
        field: 'Label', flex: 2, minWidth: 250, cellClass: 'no-outline',
        sortable: true, filter: 'agTextColumnFilter', valueGetter: (params) => (params.data as Field).Metadata?.All?.Name,
      },
      {
        field: 'Special', width: 66, headerClass: 'dense', cellClass: 'no-outline', cellRenderer: 'contentTypeFieldsSpecialComponent',
      },
      {
        field: 'Notes', flex: 2, minWidth: 250, cellClass: 'no-outline',
        sortable: true, filter: 'agTextColumnFilter', valueGetter: (params) => (params.data as Field).Metadata?.All?.Notes,
      },
      {
        width: 122, cellClass: 'secondary-action no-padding', cellRenderer: 'contentTypeFieldsActionsComponent', pinned: 'right',
        cellRendererParams: {
          onRename: (field) => this.rename(field),
          onDelete: (field) => this.delete(field),
          onOpenPermissions: (field) => this.openPermissions(field),
          onOpenMetadata: (field) => this.openMetadata(field),
        } as ContentTypeFieldsActionsParams,
      },
    ],
  };

  sortApplied = false;
  filterApplied = false;
  private gridApi: GridApi;
  private rowDragSuppressed = false;
  private contentTypeStaticName = this.route.snapshot.paramMap.get('contentTypeStaticName');
  private subscription = new Subscription();

  constructor(
    private dialogRef: MatDialogRef<ContentTypeFieldsComponent>,
    private route: ActivatedRoute,
    private router: Router,
    private contentTypesService: ContentTypesService,
    private contentTypesFieldsService: ContentTypesFieldsService,
    private snackBar: MatSnackBar,
  ) { }

  ngOnInit() {
    this.fetchFields();
    this.refreshOnChildClosed();
  }

  ngOnDestroy() {
    this.contentType$.complete();
    this.fields$.complete();
    this.subscription.unsubscribe();
  }

  closeDialog() {
    this.dialogRef.close();
  }

  onGridReady(params: GridReadyEvent) {
    this.gridApi = params.api;
  }

  onRowDragEnter(event: RowDragEvent) {
    this.gridApi.setEnableCellTextSelection(false);
  }

  onRowDragEnd(event: RowDragEvent) {
    this.gridApi.setSuppressRowDrag(true);
    const idArray = this.fields$.value.map(field => field.Id);
    this.contentTypesFieldsService.reOrder(idArray, this.contentType$.value).subscribe(res => {
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
    const columnStates = params.columnApi.getColumnState();
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
    const empties: string[] = [InputTypeConstants.EmptyDefault, InputTypeConstants.EmptyEnd];
    if (empties.includes(currentField.InputType)) {
      return params.value;
    }

    let isGroupOpen = false;
    for (const field of this.fields$.value) {
      if (field.InputType === InputTypeConstants.EmptyDefault) {
        isGroupOpen = true;
        continue;
      }
      if (field.InputType === InputTypeConstants.EmptyEnd) {
        isGroupOpen = false;
        continue;
      }
      if (field.StaticName === currentField.StaticName) {
        break;
      }
    }

    return isGroupOpen ? `<span class="is-in-group">${params.value}</span>` : params.value;
  }

  private inputTypeValueGetter(field: Field) {
    const inputType = field.InputType.substring(field.InputType.indexOf('-') + 1);
    return inputType;
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

  private createItemDefinition(field: Field, metadataType: string): AddItem | EditItem {
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
    this.contentTypesFieldsService.delete(field, this.contentType$.value).subscribe(res => {
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

  private refreshOnChildClosed() {
    this.subscription.add(
      this.router.events.pipe(
        filter(event => event instanceof NavigationEnd),
        startWith(!!this.route.snapshot.firstChild),
        map(() => !!this.route.snapshot.firstChild),
        pairwise(),
        filter(([hadChild, hasChild]) => hadChild && !hasChild),
      ).subscribe(() => {
        this.fetchFields();
      })
    );
  }

}
