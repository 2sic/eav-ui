import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { GridReadyEvent, GridSizeChangedEvent, AllCommunityModules, ColDef, RowDragEvent, GridApi } from '@ag-grid-community/all-modules';

import { EditFieldsDialogData } from '../../models/edit-fields-dialog-data.model';
import { ContentTypesFieldsService } from '../../services/content-types-fields.service';
import { Field } from '../../models/field.model';

@Component({
  selector: 'app-edit-fields',
  templateUrl: './edit-fields.component.html',
  styleUrls: ['./edit-fields.component.scss']
})
export class EditFieldsComponent implements OnInit {
  fields: Field[];
  enableTextSelection = true;

  private gridApi: GridApi;
  columnDefs: ColDef[] = [
    { headerName: 'Title', field: 'IsTitle' },
    { headerName: 'Static Name', field: 'StaticName' },
    { headerName: 'Data Type', field: 'Type' },
    { headerName: 'Input Type', field: 'InputType' },
    { headerName: 'Label', field: 'Metadata.All.Name' },
    { headerName: 'Notes', field: 'Metadata.All.Notes' },
  ];
  frameworkComponents = {
  };
  modules = AllCommunityModules;

  constructor(
    private dialogRef: MatDialogRef<EditFieldsComponent>,
    @Inject(MAT_DIALOG_DATA) public editFieldsDialogData: EditFieldsDialogData,
    private contentTypesFieldsService: ContentTypesFieldsService,
  ) { }

  ngOnInit() {
    this.fetchFields();
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
    this.contentTypesFieldsService.reOrder(idArray, this.editFieldsDialogData.contentType)
      .subscribe((res: boolean) => {
        console.log('onRowDragEnd reOrder res:', res);
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
    alert('Add fields');
  }

  private fetchFields() {
    this.contentTypesFieldsService.getFields(this.editFieldsDialogData.contentType)
      .subscribe((fields: Field[]) => {
        this.fields = fields;
      });
  }
}
