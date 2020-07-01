import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router, NavigationEnd } from '@angular/router';
import { MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';
// tslint:disable-next-line:max-line-length
import { GridReadyEvent, AllCommunityModules, GridOptions, RowDragEvent, GridApi, CellClickedEvent, SortChangedEvent, FilterChangedEvent, ValueGetterParams } from '@ag-grid-community/all-modules';

import { ContentTypesService } from '../app-administration/services/content-types.service';
import { ContentTypesFieldsService } from './services/content-types-fields.service';
import { ContentType } from '../app-administration/models/content-type.model';
import { Field } from './models/field.model';
import { eavConstants } from '../shared/constants/eav.constants';
import { EditForm, AddItem, EditItem } from '../shared/models/edit-form.model';
import { contentTypeNamePattern, contentTypeNameError } from '../app-administration/constants/content-type.patterns';
import { ContentTypeFieldsTitleComponent } from './ag-grid-components/content-type-fields-title/content-type-fields-title.component';
import { ContentTypeFieldsInputTypeComponent } from './ag-grid-components/content-type-fields-input-type/content-type-fields-input-type.component';
import { ContentTypeFieldsActionsComponent } from './ag-grid-components/content-type-fields-actions/content-type-fields-actions.component';
import { ContentTypeFieldsActionsParams } from './ag-grid-components/content-type-fields-actions/content-type-fields-actions.models';
import { ContentTypeFieldsTypeComponent } from './ag-grid-components/content-type-fields-type/content-type-fields-type.component';
import { InputTypeConstants } from './constants/input-type.constants';
import { defaultGridOptions } from '../shared/constants/default-grid-options.constants';
import { paramEncode } from '../shared/helpers/url-prep.helper';

@Component({
  selector: 'app-content-type-fields',
  templateUrl: './content-type-fields.component.html',
  styleUrls: ['./content-type-fields.component.scss']
})
export class ContentTypeFieldsComponent implements OnInit, OnDestroy {
  contentType: ContentType;
  fields: Field[];

  modules = AllCommunityModules;
  gridOptions: GridOptions = {
    ...defaultGridOptions,
    getRowClass(params: any) {
      const field: Field = params.data;
      return field.InputType === InputTypeConstants.EmptyDefault ? 'group-row' : '';
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
        width: 120, cellClass: 'secondary-action no-padding', cellRenderer: 'contentTypeFieldsActionsComponent',
        cellRendererParams: {
          onRename: this.rename.bind(this),
          onDelete: this.delete.bind(this),
          onOpenPermissions: this.openPermissions.bind(this),
        } as ContentTypeFieldsActionsParams,
      },
      {
        headerName: 'Label', field: 'Metadata.All.Name', flex: 2, minWidth: 250, cellClass: 'no-outline',
        sortable: true, filter: 'agTextColumnFilter',
      },
      {
        headerName: 'Notes', field: 'Metadata.All.Notes', flex: 2, minWidth: 250, cellClass: 'no-outline',
        sortable: true, filter: 'agTextColumnFilter',
      },
    ],
  };

  private gridApi: GridApi;
  private sortApplied = false;
  private filterApplied = false;
  private rowDragSuppressed = false;
  private contentTypeStaticName: string;
  private subscription = new Subscription();
  private hasChild: boolean;

  constructor(
    private dialogRef: MatDialogRef<ContentTypeFieldsComponent>,
    private route: ActivatedRoute,
    private router: Router,
    private contentTypesService: ContentTypesService,
    private contentTypesFieldsService: ContentTypesFieldsService,
    private snackBar: MatSnackBar,
    private changeDetectorRef: ChangeDetectorRef,
  ) {
    this.hasChild = !!this.route.snapshot.firstChild;
    this.contentTypeStaticName = this.route.snapshot.paramMap.get('contentTypeStaticName');
  }

  async ngOnInit() {
    this.contentType = await this.contentTypesService.retrieveContentType(this.contentTypeStaticName).toPromise();
    await this.fetchFields();
    this.refreshOnChildClosed();
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
    this.subscription = null;
  }

  onGridReady(params: GridReadyEvent) {
    this.gridApi = params.api;
  }

  onRowDragEnter(event: RowDragEvent) {
    this.gridApi.setEnableCellTextSelection(false);
  }

  onRowDragEnd(event: RowDragEvent) {
    this.gridApi.setSuppressRowDrag(true);
    const idArray = this.fields.map(field => field.Id);
    this.contentTypesFieldsService.reOrder(idArray, this.contentType).subscribe(async res => {
      await this.fetchFields();
      this.changeDetectorRef.detectChanges();
      this.gridApi.setEnableCellTextSelection(true);
      this.gridApi.setSuppressRowDrag(false);
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
      const fromIndex = this.fields.indexOf(movingData);
      const toIndex = this.fields.indexOf(overData);
      this.moveInArray(this.fields, fromIndex, toIndex);
      this.gridApi.setRowData(this.fields);
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

  closeDialog() {
    this.dialogRef.close();
  }

  add() {
    this.router.navigate([`add/${this.contentTypeStaticName}`], { relativeTo: this.route });
  }

  private inputTypeValueGetter(params: ValueGetterParams) {
    const field: Field = params.data;
    const inputType = field.InputType.substring(field.InputType.indexOf('-') + 1);
    return inputType;
  }

  private async fetchFields() {
    this.fields = await this.contentTypesFieldsService.getFields(this.contentType).toPromise();
  }

  private editFieldMetadata(params: CellClickedEvent) {
    const field: Field = params.data;
    const form: EditForm = {
      items: [
        this.createItemDefinition(field, 'All'),
        this.createItemDefinition(field, field.Type),
        this.createItemDefinition(field, field.InputType)
      ],
    };
    this.router.navigate([`edit/${paramEncode(JSON.stringify(form))}`], { relativeTo: this.route });
  }

  private createItemDefinition(field: Field, metadataType: string): AddItem | EditItem {
    return field.Metadata[metadataType] !== undefined
      ? { EntityId: field.Metadata[metadataType].Id } // if defined, return the entity-number to edit
      : {
        ContentTypeName: '@' + metadataType, // otherwise the content type for new-assignment
        For: {
          Target: eavConstants.metadata.attribute.target,
          Number: field.Id
        },
        Prefill: { Name: field.StaticName },
      };
  }

  private setTitle(params: CellClickedEvent) {
    const field: Field = params.data;
    this.snackBar.open('Setting title...');
    this.contentTypesFieldsService.setTitle(field, this.contentType).subscribe(() => {
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
    while (!newName.match(contentTypeNamePattern)) {
      newName = prompt(`What new name would you like for '${field.StaticName}' (${field.Id})?\n${contentTypeNameError}`, newName);
      if (newName === null) { return; }
      newName = newName.trim().replace(/\s\s+/g, ' '); // remove multiple white spaces and tabs
      if (newName === field.StaticName) { return; }
    }
    this.snackBar.open('Saving...');
    this.contentTypesFieldsService.rename(field, this.contentType, newName).subscribe(() => {
      this.snackBar.open('Saved', null, { duration: 2000 });
      this.fetchFields();
    });
  }

  private delete(field: Field) {
    if (!confirm(`Are you sure you want to delete '${field.StaticName}' (${field.Id})?`)) { return; }
    this.snackBar.open('Deleting...');
    this.contentTypesFieldsService.delete(field, this.contentType).subscribe(res => {
      this.snackBar.open('Deleted', null, { duration: 2000 });
      this.fetchFields();
    });
  }

  private openPermissions(field: Field) {
    this.router.navigate(
      [`permissions/${eavConstants.metadata.attribute.type}/${eavConstants.keyTypes.number}/${field.Id}`],
      { relativeTo: this.route }
    );
  }

  private refreshOnChildClosed() {
    this.subscription.add(
      this.router.events.pipe(filter(event => event instanceof NavigationEnd)).subscribe((event: NavigationEnd) => {
        const hadChild = this.hasChild;
        this.hasChild = !!this.route.snapshot.firstChild;
        if (!this.hasChild && hadChild) {
          this.fetchFields();
        }
      })
    );
  }

}
