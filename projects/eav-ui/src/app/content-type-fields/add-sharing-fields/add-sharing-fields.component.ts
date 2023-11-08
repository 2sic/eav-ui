import { Component, OnDestroy, OnInit } from '@angular/core';
import { BaseSubsinkComponent } from '../../shared/components/base-subsink-component/base-subsink.component';
import { MatDialogRef } from '@angular/material/dialog';
import { Field } from '../models/field.model';
import { ContentTypesFieldsService } from '../services/content-types-fields.service';
import { MatTableDataSource } from '@angular/material/table';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-add-sharing-fields',
  templateUrl: './add-sharing-fields.component.html',
  styleUrls: ['./add-sharing-fields.component.scss']
})
export class AddSharingFieldsComponent extends BaseSubsinkComponent implements OnInit, OnDestroy {
  displayedShareableFieldsColumns: string[] = ['contentType', 'name', 'type', 'share'];
  displayedSelectedFieldsColumns: string[] = ['newName', 'source', 'remove'];

  shareableFields = new MatTableDataSource<Field>([]);
  selectedFields = new MatTableDataSource<NewNameField>([]);


  constructor(
    private dialogRef: MatDialogRef<AddSharingFieldsComponent>,
    private contentTypesFieldsService: ContentTypesFieldsService,
    private snackBar: MatSnackBar,
  ) {
    super();
  }

  ngOnInit() {
    // TODO: @SDV Try to find a better way to do this
    this.subscription = this.contentTypesFieldsService.getShareableFields().subscribe(shareableFields => {
      this.shareableFields.data = shareableFields;
    });
  }

  ngOnDestroy() {
    super.ngOnDestroy();
  }

  // TODO: @SDV Try to find a better way to do this
  selectField(field: Field) {
    const selectedFields = this.selectedFields.data;
    selectedFields.push({ newName: field.StaticName, field });
    this.selectedFields.data = selectedFields;

  }

  // TODO: @SDV Try to find a better way to do this
  removeField(field: NewNameField) {
    const selectedFields = this.selectedFields.data;
    selectedFields.splice(selectedFields.indexOf(field), 1);
    this.selectedFields.data = selectedFields;
  }

  // When API gets created we will need to send the selected fields to the API
  save() {
    // this.snackBar.open('Saving...');
    // this.snackBar.open('Saved', null, { duration: 2000 });
    console.log("SDV - API not implemented yet", this.selectedFields.data)
    this.closeDialog();
  }

  closeDialog() {
    this.dialogRef.close();
  }
}

export interface AppSharingFieldsViewModel {
  shareableFields: Field[];
  selectedFields: Field[];
}

interface NewNameField {
  newName: string;
  field: Field;
}