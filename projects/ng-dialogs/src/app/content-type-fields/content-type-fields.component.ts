// tslint:disable-next-line:max-line-length
import { AllCommunityModules, CellClickedEvent, FilterChangedEvent, GridApi, GridOptions, GridReadyEvent, RowDragEvent, SortChangedEvent, ValueGetterParams } from '@ag-grid-community/all-modules';
import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { BehaviorSubject, forkJoin, Subscription } from 'rxjs';
import { filter, map, mergeMap, pairwise, share, startWith } from 'rxjs/operators';
import { fieldNameError, fieldNamePattern } from '../app-administration/constants/field-name.patterns';
import { ContentType } from '../app-administration/models/content-type.model';
import { ContentTypesService } from '../app-administration/services/content-types.service';
import { GoToPermissions } from '../permissions/go-to-permissions';
import { defaultGridOptions } from '../shared/constants/default-grid-options.constants';
import { eavConstants } from '../shared/constants/eav.constants';
import { convertFormToUrl } from '../shared/helpers/url-prep.helper';
import { AddItem, EditForm, EditItem } from '../shared/models/edit-form.model';
import { ContentTypeFieldsActionsComponent } from './ag-grid-components/content-type-fields-actions/content-type-fields-actions.component';
import { ContentTypeFieldsActionsParams } from './ag-grid-components/content-type-fields-actions/content-type-fields-actions.models';
import { ContentTypeFieldsInputTypeComponent } from './ag-grid-components/content-type-fields-input-type/content-type-fields-input-type.component';
import { ContentTypeFieldsTitleComponent } from './ag-grid-components/content-type-fields-title/content-type-fields-title.component';
import { ContentTypeFieldsTypeComponent } from './ag-grid-components/content-type-fields-type/content-type-fields-type.component';
import { InputTypeConstants } from './constants/input-type.constants';
import { Field } from './models/field.model';
import { ContentTypesFieldsService } from './services/content-types-fields.service';

@Component({
  selector: 'app-content-type-fields',
  templateUrl: './content-type-fields.component.html',
  styleUrls: ['./content-type-fields.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ContentTypeFieldsComponent implements OnInit, OnDestroy {
  contentType$ = new BehaviorSubject<ContentType>(null);
  fields$ = new BehaviorSubject<Field[]>(null);

  modules = AllCommunityModules;
  gridOptions: GridOptions = {
    ...defaultGridOptions,
    getRowClass(params) {
      const field: Field = params.data;
      if (field.InputType === InputTypeConstants.EmptyDefault) { return 'group-start-row'; }
      if (field.InputType === InputTypeConstants.EmptyEnd) { return 'group-end-row'; }
      return '';
    },
    frameworkComponents: {
      contentTypeFieldsTitleComponent: ContentTypeFieldsTitleComponent,
      contentTypeFieldsTypeComponent: ContentTypeFieldsTypeComponent,
      contentTypeFieldsInputTypeComponent: ContentTypeFieldsInputTypeComponent,
      contentTypeFieldsActionsComponent: ContentTypeFieldsActionsComponent,
    },
    columnDefs: [
      { rowDrag: true, width: 18, cellClass: 'no-select no-padding no-outline' },
      {
        headerName: 'Title', field: 'IsTitle', width: 42, cellClass: 'secondary-action no-padding no-outline',
        cellRenderer: 'contentTypeFieldsTitleComponent', onCellClicked: this.setTitle.bind(this),
      },
      {
        headerName: 'Name', field: 'StaticName', flex: 2, minWidth: 250, cellClass: 'primary-action highlight',
        sortable: true, filter: 'agTextColumnFilter', onCellClicked: this.editFieldMetadata.bind(this),
      },
      {
        headerName: 'Type', field: 'Type', width: 70, headerClass: 'dense', cellClass: 'no-outline', sortable: true,
        filter: 'agTextColumnFilter', cellRenderer: 'contentTypeFieldsTypeComponent',
      },
      {
        headerName: 'Input', field: 'InputType', width: 160, cellClass: 'secondary-action no-padding',
        sortable: true, filter: 'agTextColumnFilter', cellRenderer: 'contentTypeFieldsInputTypeComponent',
        onCellClicked: this.changeInputType.bind(this), valueGetter: this.inputTypeValueGetter,
      },
      {
        headerName: 'Label', field: 'Metadata.All.Name', flex: 2, minWidth: 250, cellClass: 'no-outline',
        sortable: true, filter: 'agTextColumnFilter',
      },
      {
        headerName: 'Notes', field: 'Metadata.All.Notes', flex: 2, minWidth: 250, cellClass: 'no-outline',
        sortable: true, filter: 'agTextColumnFilter',
      },
      {
        width: 80, cellClass: 'secondary-action no-padding', cellRenderer: 'contentTypeFieldsActionsComponent', pinned: 'right',
        cellRendererParams: {
          onRename: this.rename.bind(this),
          onDelete: this.delete.bind(this),
          onOpenPermissions: this.openPermissions.bind(this),
        } as ContentTypeFieldsActionsParams,
      },
    ],
  };

  private gridApi: GridApi;
  private sortApplied = false;
  private filterApplied = false;
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
    const sortModel = this.gridApi.getSortModel();
    this.sortApplied = sortModel.length > 0;
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

  private inputTypeValueGetter(params: ValueGetterParams) {
    const field: Field = params.data;
    const inputType = field.InputType.substring(field.InputType.indexOf('-') + 1);
    return inputType;
  }

  private fetchFields(callback?: () => void) {
    if (this.contentType$.value == null) {
      const contentType$ = this.contentTypesService.retrieveContentType(this.contentTypeStaticName).pipe(share());
      const fields$ = contentType$.pipe(mergeMap(contentType => this.contentTypesFieldsService.getFields(contentType)));
      forkJoin([contentType$, fields$]).subscribe(([contentType, fields]) => {
        this.contentType$.next(contentType);
        this.fields$.next(fields);
        if (callback != null) { callback(); }
      });
    } else {
      this.contentTypesFieldsService.getFields(this.contentType$.value).subscribe(fields => {
        this.fields$.next(fields);
        if (callback != null) { callback(); }
      });
    }
  }

  private editFieldMetadata(params: CellClickedEvent) {
    const field: Field = params.data;
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
          Number: field.Id,
        },
        Prefill: { Name: field.StaticName },
      };
  }

  private setTitle(params: CellClickedEvent) {
    const field: Field = params.data;
    this.snackBar.open('Setting title...');
    this.contentTypesFieldsService.setTitle(field, this.contentType$.value).subscribe(() => {
      this.snackBar.open('Title set', null, { duration: 2000 });
      this.fetchFields();
    });
  }

  private changeInputType(params: CellClickedEvent) {
    const field: Field = params.data;
    this.router.navigate([`update/${this.contentTypeStaticName}/${field.Id}`], { relativeTo: this.route });
  }

  private rename(field: Field) {
    let newName = prompt(`What new name would you like for '${field.StaticName}' (${field.Id})?`, field.StaticName);
    if (newName === null) { return; }
    newName = newName.trim().replace(/\s\s+/g, ' '); // remove multiple white spaces and tabs
    if (newName === field.StaticName) { return; }
    while (!newName.match(fieldNamePattern)) {
      newName = prompt(`What new name would you like for '${field.StaticName}' (${field.Id})?\n${fieldNameError}`, newName);
      if (newName === null) { return; }
      newName = newName.trim().replace(/\s\s+/g, ' '); // remove multiple white spaces and tabs
      if (newName === field.StaticName) { return; }
    }
    this.snackBar.open('Saving...');
    this.contentTypesFieldsService.rename(field, this.contentType$.value, newName).subscribe(() => {
      this.snackBar.open('Saved', null, { duration: 2000 });
      this.fetchFields();
    });
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
    this.router.navigate([GoToPermissions.goAttribute(field.Id)], { relativeTo: this.route });
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
