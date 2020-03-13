import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialogRef } from '@angular/material/dialog';
import { Subscription } from 'rxjs';
// tslint:disable-next-line:max-line-length
import { GridReadyEvent, GridSizeChangedEvent, AllCommunityModules, ColDef, RowDragEvent, GridApi, ICellRendererParams, CellClickedEvent } from '@ag-grid-community/all-modules';

import { ContentTypesService } from '../../services/content-types.service';
import { ContentTypesFieldsService } from '../../services/content-types-fields.service';
import { ContentType } from '../../models/content-type.model';
import { Field } from '../../models/field.model';
import { DialogService } from '../../../../shared/components/dialog-service/dialog.service';
import { EDIT_CONTENT_TYPE_FIELDS_DIALOG, ITEMS_EDIT_DIALOG } from '../../../../shared/constants/dialog-names';
import { eavConstants } from '../../../../shared/constants/eav-constants';
import { EditForm, AddItem, EditItem } from '../../models/edit-form.model';
import { contentTypeNamePattern, contentTypeNameError } from '../../constants/content-type';

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
    {
      headerName: 'Title', field: 'IsTitle', rowDrag: true, cellClass: 'no-padding no-outline no-select',
      cellRenderer: (params: ICellRendererParams) => {
        return `
          <div class="icon-container">
            <i class="material-icons pointer" action="set-title" title="Use as title field">
              ${params.value ? 'star' : 'star_border'}
            </i>
          </div>
        `;
      }, onCellClicked: this.activateAction.bind(this),
    },
    { headerName: 'Static Name', field: 'StaticName', cellClass: 'clickable', onCellClicked: this.editFieldMetadata.bind(this) },
    { headerName: 'Data Type', field: 'Type', cellClass: 'clickable', onCellClicked: this.editFieldMetadata.bind(this) },
    {
      headerName: 'Input Type', field: 'InputType', cellClass: 'clickable-single-with-button no-outline no-select',
      cellRenderer: (params: ICellRendererParams) => {
        return `
          <div class="icon-container">
            <i class="material-icons pointer" action="change-input-type" title="Change Input Type">edit</i>
            &nbsp;
            <span class="text" action="change-input-type" title="Change Input Type">${params.value}</span>
          </div>
        `;
      }, onCellClicked: this.activateAction.bind(this),
    },
    { headerName: 'Label', field: 'Metadata.All.Name', cellClass: 'clickable', onCellClicked: this.editFieldMetadata.bind(this) },
    { headerName: 'Notes', field: 'Metadata.All.Notes', cellClass: 'clickable', onCellClicked: this.editFieldMetadata.bind(this) },
    {
      headerName: '', cellClass: 'no-padding no-outline no-select', cellRenderer: (params: ICellRendererParams) => {
        const field = <Field>params.data;
        const showPermissions = field.InputType === 'string-wysiwyg' || field.Type === 'Hyperlink';
        return `
          <div class="icon-container">
            <i class="material-icons pointer" action="rename" title="Rename">settings</i>
            &nbsp;
            <i class="material-icons pointer" action="delete" title="Delete">delete</i>
            ${showPermissions
            ? '&nbsp;<i class="material-icons pointer" action="permissions" title="Permissions">person</i>'
            : ''}
          </div>
        `;
      }, onCellClicked: this.activateAction.bind(this),
    },
  ];
  frameworkComponents = {
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

  private activateAction(params: CellClickedEvent) {
    const field = <Field>params.data;
    const action = (<HTMLElement>(<MouseEvent>params.event).target).getAttribute('action');

    switch (action) {
      case 'set-title':
        this.contentTypesFieldsService.setTitle(<Field>params.data, this.contentType).subscribe(() => {
          this.fetchFields();
        });
        break;
      case 'change-input-type':
        this.router.navigate([`update/${field.Id}`], { relativeTo: this.route });
        break;
      case 'rename':
        let newName = prompt(`What new name would you like for '${field.StaticName}' (${field.Id})?`, field.StaticName);
        if (!newName || newName === field.StaticName) { break; }
        if (!newName.match(contentTypeNamePattern)) {
          while (1) {
            newName = prompt(
              `What new name would you like for '${field.StaticName}' (${field.Id})?` + `\n${contentTypeNameError}`,
              newName
            );
            if (!newName || newName.match(contentTypeNamePattern)) { break; }
          }
        }
        if (!newName || newName === field.StaticName) { break; }
        this.contentTypesFieldsService.rename(field, this.contentType, newName).subscribe(() => {
          this.fetchFields();
        });
        break;
      case 'delete':
        if (field.IsTitle) { alert('Can\'t delete title'); break; }
        if (!confirm(`Are you sure you want to delete '${field.StaticName}' (${field.Id})?`)) { break; }
        this.contentTypesFieldsService.delete(field, this.contentType).subscribe(res => {
          this.fetchFields();
        });
        break;
      case 'permissions':
        this.router.navigate(
          [`${eavConstants.metadata.attribute.type}/${eavConstants.keyTypes.number}/${field.Id}/permissions`],
          { relativeTo: this.route }
        );
        break;
      default:
        return;
    }
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
