import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialogRef } from '@angular/material/dialog';
import { Subscription } from 'rxjs';
// tslint:disable-next-line:max-line-length
import { GridReadyEvent, GridSizeChangedEvent, AllCommunityModules, ColDef, RowDragEvent, GridApi, CellClickedEvent } from '@ag-grid-community/all-modules';

import { ContentTypesService } from '../../services/content-types.service';
import { ContentTypesFieldsService } from '../../services/content-types-fields.service';
import { ContentType } from '../../models/content-type.model';
import { Field } from '../../models/field.model';
import { DialogService } from '../../../../shared/components/dialog-service/dialog.service';
import { EDIT_CONTENT_TYPE_FIELDS_DIALOG, ITEMS_EDIT_DIALOG } from '../../../../shared/constants/dialog-names';
import { eavConstants } from '../../../../shared/constants/eav-constants';
import { EditForm, AddItem, EditItem } from '../../models/edit-form.model';
import { contentTypeNamePattern, contentTypeNameError } from '../../constants/content-type';
import { ContentTypeFieldsTitleComponent } from '../../ag-grid-components/content-type-fields-title/content-type-fields-title.component';
import { ContentTypeFieldsTitleParams } from '../../models/content-type-fields-title-params';
import { ContentTypeFieldsInputTypeParams } from '../../models/content-type-fields-input-type-params';
// tslint:disable-next-line:max-line-length
import { ContentTypeFieldsInputTypeComponent } from '../../ag-grid-components/content-type-fields-input-type/content-type-fields-input-type.component';
// tslint:disable-next-line:max-line-length
import { ContentTypeFieldsActionsComponent } from '../../ag-grid-components/content-type-fields-actions/content-type-fields-actions.component';
import { ContentTypeFieldsActionsParams } from '../../models/content-type-fields-actions-params';

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
    { rowDrag: true, width: 56, suppressSizeToFit: true },
    {
      headerName: 'Title', field: 'IsTitle', width: 72, suppressSizeToFit: true, cellClass: 'no-padding',
      cellRenderer: 'contentTypeFieldsTitleComponent', cellRendererParams: <ContentTypeFieldsTitleParams>{
        onSetTitle: this.setTitle.bind(this),
      },
    },
    {
      headerName: 'Static Name', field: 'StaticName', minWidth: 250, width: 200, cellClass: 'clickable', sortable: true,
      filter: 'agTextColumnFilter', onCellClicked: this.editFieldMetadata.bind(this),
    },
    {
      headerName: 'Data Type', field: 'Type', minWidth: 184, width: 100, cellClass: 'clickable', sortable: true,
      filter: 'agTextColumnFilter', onCellClicked: this.editFieldMetadata.bind(this),
    },
    {
      headerName: 'Input Type', field: 'InputType', minWidth: 184, width: 100, cellClass: 'clickable-single-with-button',
      sortable: true, filter: 'agTextColumnFilter', cellRenderer: 'contentTypeFieldsInputTypeComponent',
      cellRendererParams: <ContentTypeFieldsInputTypeParams>{
        onChangeInputType: this.changeInputType.bind(this),
      },
    },
    {
      headerName: 'Label', field: 'Metadata.All.Name', minWidth: 250, width: 200, cellClass: 'clickable', sortable: true,
      filter: 'agTextColumnFilter', onCellClicked: this.editFieldMetadata.bind(this),
    },
    {
      headerName: 'Notes', field: 'Metadata.All.Notes', minWidth: 250, width: 200, cellClass: 'clickable', sortable: true,
      filter: 'agTextColumnFilter', onCellClicked: this.editFieldMetadata.bind(this),
    },
    {
      headerName: 'Actions', width: 200, suppressSizeToFit: true, cellRenderer: 'contentTypeFieldsActionsComponent',
      cellRendererParams: <ContentTypeFieldsActionsParams>{
        onRename: this.rename.bind(this),
        onDelete: this.delete.bind(this),
        onOpenPermissions: this.openPermissions.bind(this),
      }
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

  constructor(
    private dialogRef: MatDialogRef<ContentTypeFieldsComponent>,
    private route: ActivatedRoute,
    private router: Router,
    private contentTypesService: ContentTypesService,
    private contentTypesFieldsService: ContentTypesFieldsService,
    private dialogService: DialogService,
  ) {
    this.contentTypeStaticName = this.route.snapshot.paramMap.get('contentTypeStaticName');
  }

  async ngOnInit() {
    this.contentType = await this.contentTypesService.retrieveContentType(this.contentTypeStaticName).toPromise();
    await this.fetchFields();
    this.refreshOnClosedChildDialogs();
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
    this.subscription = null;
  }

  onGridReady(params: GridReadyEvent) {
    params.api.sizeColumnsToFit();
  }

  onGridSizeChanged(params: GridSizeChangedEvent) {
    this.gridApi = params.api;
    params.api.sizeColumnsToFit();
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
      const movingData = <Field>movingNode.data;
      const overData = <Field>overNode.data;
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
    this.router.navigate(['add'], { relativeTo: this.route });
  }

  async fetchFields() {
    this.fields = await this.contentTypesFieldsService.getFields(this.contentType).toPromise();
  }

  private editFieldMetadata(params: CellClickedEvent) {
    const field = <Field>params.data;
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
    this.router.navigate([`update/${field.Id}`], { relativeTo: this.route });
  }

  private rename(field: Field) {
    let newName = prompt(`What new name would you like for '${field.StaticName}' (${field.Id})?`, field.StaticName);
    if (!newName || newName === field.StaticName) { return; }
    if (!newName.match(contentTypeNamePattern)) {
      while (1) {
        newName = prompt(
          `What new name would you like for '${field.StaticName}' (${field.Id})?` + `\n${contentTypeNameError}`,
          newName
        );
        if (!newName || newName.match(contentTypeNamePattern)) { break; }
      }
    }
    if (!newName || newName === field.StaticName) { return; }
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
      [`${eavConstants.metadata.attribute.type}/${eavConstants.keyTypes.number}/${field.Id}/permissions`],
      { relativeTo: this.route }
    );
  }

  private refreshOnClosedChildDialogs() {
    this.subscription.add(
      this.dialogService.subToClosed([EDIT_CONTENT_TYPE_FIELDS_DIALOG, ITEMS_EDIT_DIALOG]).subscribe(closedDialog => {
        console.log('Dialog closed event captured:', closedDialog);
        this.fetchFields();
      }),
    );
  }
}
