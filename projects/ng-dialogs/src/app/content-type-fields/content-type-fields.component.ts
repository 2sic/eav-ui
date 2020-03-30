import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router, NavigationEnd } from '@angular/router';
import { MatDialogRef } from '@angular/material/dialog';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';
import { GridReadyEvent, AllCommunityModules, ColDef, RowDragEvent, GridApi, CellClickedEvent } from '@ag-grid-community/all-modules';

import { ContentTypesService } from '../app-administration/shared/services/content-types.service';
import { ContentTypesFieldsService } from './services/content-types-fields.service';
import { ContentType } from '../app-administration/shared/models/content-type.model';
import { Field } from './models/field.model';
import { eavConstants } from '../shared/constants/eav-constants';
import { EditForm, AddItem, EditItem } from '../app-administration/shared/models/edit-form.model';
import { contentTypeNamePattern, contentTypeNameError } from '../app-administration/shared/constants/content-type';
import { ContentTypeFieldsTitleComponent } from './ag-grid-components/content-type-fields-title/content-type-fields-title.component';
import { ContentTypeFieldsTitleParams } from './models/content-type-fields-title-params';
import { ContentTypeFieldsInputTypeParams } from './models/content-type-fields-input-type-params';
import { ContentTypeFieldsInputTypeComponent } from './ag-grid-components/content-type-fields-input-type/content-type-fields-input-type.component';
import { ContentTypeFieldsActionsComponent } from './ag-grid-components/content-type-fields-actions/content-type-fields-actions.component';
import { ContentTypeFieldsActionsParams } from './models/content-type-fields-actions-params';

@Component({
  selector: 'app-content-type-fields',
  templateUrl: './content-type-fields.component.html',
  styleUrls: ['./content-type-fields.component.scss']
})
export class ContentTypeFieldsComponent implements OnInit, OnDestroy {
  fields: Field[];
  enableTextSelection = true;

  private gridApi: GridApi;
  columnDefs: ColDef[] = [
    { rowDrag: true, width: 18, cellClass: 'no-padding' },
    {
      headerName: 'Title', field: 'IsTitle', width: 80, cellClass: 'no-padding',
      cellRenderer: 'contentTypeFieldsTitleComponent', cellRendererParams: {
        onSetTitle: this.setTitle.bind(this),
      } as ContentTypeFieldsTitleParams,
    },
    {
      headerName: 'Static Name', field: 'StaticName', flex: 2, minWidth: 250, cellClass: 'clickable', sortable: true,
      filter: 'agTextColumnFilter', onCellClicked: this.editFieldMetadata.bind(this),
    },
    {
      headerName: 'Data Type', field: 'Type', flex: 1, minWidth: 184, cellClass: 'clickable', sortable: true,
      filter: 'agTextColumnFilter', onCellClicked: this.editFieldMetadata.bind(this),
    },
    {
      headerName: 'Input Type', field: 'InputType', flex: 1, minWidth: 184, cellClass: 'no-padding',
      sortable: true, filter: 'agTextColumnFilter', cellRenderer: 'contentTypeFieldsInputTypeComponent',
      cellRendererParams: {
        onChangeInputType: this.changeInputType.bind(this),
      } as ContentTypeFieldsInputTypeParams,
    },
    {
      headerName: 'Label', field: 'Metadata.All.Name', flex: 2, minWidth: 250, cellClass: 'clickable', sortable: true,
      filter: 'agTextColumnFilter', onCellClicked: this.editFieldMetadata.bind(this),
    },
    {
      headerName: 'Notes', field: 'Metadata.All.Notes', flex: 2, minWidth: 250, cellClass: 'clickable', sortable: true,
      filter: 'agTextColumnFilter', onCellClicked: this.editFieldMetadata.bind(this),
    },
    {
      headerName: 'Actions', flex: 1, minWidth: 194, cellClass: 'no-padding', cellRenderer: 'contentTypeFieldsActionsComponent',
      cellRendererParams: {
        onRename: this.rename.bind(this),
        onDelete: this.delete.bind(this),
        onOpenPermissions: this.openPermissions.bind(this),
      } as ContentTypeFieldsActionsParams,
    },
  ];
  frameworkComponents = {
    contentTypeFieldsTitleComponent: ContentTypeFieldsTitleComponent,
    contentTypeFieldsInputTypeComponent: ContentTypeFieldsInputTypeComponent,
    contentTypeFieldsActionsComponent: ContentTypeFieldsActionsComponent,
  };
  modules = AllCommunityModules;

  private contentTypeStaticName: string;
  private contentType: ContentType;
  private subscription = new Subscription();
  private hasChild: boolean;

  constructor(
    private dialogRef: MatDialogRef<ContentTypeFieldsComponent>,
    private route: ActivatedRoute,
    private router: Router,
    private contentTypesService: ContentTypesService,
    private contentTypesFieldsService: ContentTypesFieldsService,
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
    this.enableTextSelection = false;
  }

  onRowDragEnd(event: RowDragEvent) {
    this.enableTextSelection = true;
    const idArray = this.fields.map(field => field.Id);
    this.contentTypesFieldsService.reOrder(idArray, this.contentType).subscribe(res => {
      this.fetchFields();
    });
  }

  onRowDragMove(event: RowDragEvent) {
    const movingNode = event.node;
    const overNode = event.overNode;
    const rowNeedsToMove = movingNode !== overNode;
    if (rowNeedsToMove) {
      const movingData: Field = movingNode.data;
      const overData: Field = overNode.data;
      const fromIndex = this.fields.indexOf(movingData);
      const toIndex = this.fields.indexOf(overData);
      const newStore = this.fields.slice();
      this.moveInArray(newStore, fromIndex, toIndex);
      this.fields = newStore;
      this.gridApi.setRowData(newStore);
      this.gridApi.clearFocusedCell();
    }
  }

  private moveInArray(arr: Field[], fromIndex: number, toIndex: number) {
    const element = arr[fromIndex];
    arr.splice(fromIndex, 1);
    arr.splice(toIndex, 0, element);
  }

  closeDialog() {
    this.dialogRef.close();
  }

  add() {
    this.router.navigate([`add/${this.contentTypeStaticName}`], { relativeTo: this.route });
  }

  async fetchFields() {
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
      persistedData: null,
    };
    this.router.navigate([`edit/${JSON.stringify(form)}`], { relativeTo: this.route });
  }

  private createItemDefinition(field: Field, metadataType: string): AddItem | EditItem {
    const title = metadataType === 'All' ? 'General Settings' : metadataType;
    return field.Metadata[metadataType] !== undefined
      ? { EntityId: field.Metadata[metadataType].Id, Title: title } // if defined, return the entity-number to edit
      : {
        ContentTypeName: '@' + metadataType, // otherwise the content type for new-assegnment
        For: {
          Target: eavConstants.metadata.attribute.target,
          Number: field.Id
        },
        Prefill: { Name: field.StaticName },
      };
  }

  private setTitle(field: Field) {
    this.contentTypesFieldsService.setTitle(field, this.contentType).subscribe(() => {
      this.fetchFields();
    });
  }

  private changeInputType(field: Field) {
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
    this.contentTypesFieldsService.rename(field, this.contentType, newName).subscribe(() => {
      this.fetchFields();
    });
  }

  private delete(field: Field) {
    if (!confirm(`Are you sure you want to delete '${field.StaticName}' (${field.Id})?`)) { return; }
    this.contentTypesFieldsService.delete(field, this.contentType).subscribe(res => {
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
