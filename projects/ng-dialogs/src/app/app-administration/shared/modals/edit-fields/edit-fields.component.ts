import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MatDialogRef } from '@angular/material/dialog';
import { GridReadyEvent, GridSizeChangedEvent, AllCommunityModules, ColDef, RowDragEvent, GridApi } from '@ag-grid-community/all-modules';

import { ContentTypesService } from '../../services/content-types.service';
import { ContentTypesFieldsService } from '../../services/content-types-fields.service';
import { ContentType } from '../../models/content-type.model';
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
    { headerName: 'Title', field: 'IsTitle', rowDrag: true },
    { headerName: 'Static Name', field: 'StaticName' },
    { headerName: 'Data Type', field: 'Type' },
    { headerName: 'Input Type', field: 'InputType' },
    { headerName: 'Label', field: 'Metadata.All.Name' },
    { headerName: 'Notes', field: 'Metadata.All.Notes' },
  ];
  frameworkComponents = {
  };
  modules = AllCommunityModules;

  private scope: string;
  private contentTypeStaticName: string;
  private contentType: ContentType;

  constructor(
    private dialogRef: MatDialogRef<EditFieldsComponent>,
    private route: ActivatedRoute,
    private contentTypesService: ContentTypesService,
    private contentTypesFieldsService: ContentTypesFieldsService,
  ) {
    this.scope = this.route.snapshot.paramMap.get('scope');
    this.contentTypeStaticName = this.route.snapshot.paramMap.get('contentTypeStaticName');
  }

  ngOnInit() {
    this.fetchData();
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
    alert('Add fields');
  }

  private fetchFields() {
    this.contentTypesFieldsService.getFields(this.contentType).subscribe(fields => {
      this.fields = fields;
    });
  }

  private fetchData() {
    this.contentTypesService.retrieveContentTypes(this.scope).subscribe(contentTypes => {
      this.contentType = contentTypes.find(contentType => contentType.StaticName === this.contentTypeStaticName);

      this.fetchFields();
    });
  }
}
