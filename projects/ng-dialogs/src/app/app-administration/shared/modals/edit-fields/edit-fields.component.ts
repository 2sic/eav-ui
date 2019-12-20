import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

import { EditFieldsDialogData } from '../../models/edit-fields-dialog-data.model';
import { GridReadyEvent, GridSizeChangedEvent, AllCommunityModules, ColDef } from '@ag-grid-community/all-modules';
import { ContentTypesFieldsService } from '../../services/content-types-fields.service';
import { Field } from '../../models/field.model';

@Component({
  selector: 'app-edit-fields',
  templateUrl: './edit-fields.component.html',
  styleUrls: ['./edit-fields.component.scss']
})
export class EditFieldsComponent implements OnInit {
  fields: Field[];

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
    params.api.sizeColumnsToFit();
  }

  closeDialog() {
    this.dialogRef.close();
  }

  add() {
    alert('Add fields');
  }

  private fetchFields() {
    this.contentTypesFieldsService.getFields(this.editFieldsDialogData.appId, this.editFieldsDialogData.contentType)
      .subscribe((fields: Field[]) => {
        this.fields = fields;
      });
  }
}
