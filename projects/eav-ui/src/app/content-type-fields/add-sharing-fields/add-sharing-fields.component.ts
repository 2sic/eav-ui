import { Component, OnDestroy, OnInit } from '@angular/core';
import { BaseSubsinkComponent } from '../../shared/components/base-subsink-component/base-subsink.component';
import { MatDialogRef } from '@angular/material/dialog';
import { Field } from '../models/field.model';
import { ContentTypesFieldsService } from '../services/content-types-fields.service';
import { MatTableDataSource } from '@angular/material/table';

@Component({
  selector: 'app-add-sharing-fields',
  templateUrl: './add-sharing-fields.component.html',
  styleUrls: ['./add-sharing-fields.component.scss']
})
export class AddSharingFieldsComponent extends BaseSubsinkComponent implements OnInit, OnDestroy {
  displayedShareableFieldsColumns: string[] = ['contentType', 'name', 'type', 'share'];
  displayedSelectedFieldsColumns: string[] = ['name', 'source', 'remove'];

  shareableFields = new MatTableDataSource<Field>([]);
  selectedFields = new MatTableDataSource<Field>([]);

  constructor(
    private dialogRef: MatDialogRef<AddSharingFieldsComponent>,
    private contentTypesFieldsService: ContentTypesFieldsService,
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
    const shareableFields = this.shareableFields.data;
    selectedFields.push(field);
    shareableFields.splice(shareableFields.indexOf(field), 1);
    this.selectedFields.data = selectedFields;
    this.shareableFields.data = shareableFields;
  }

  // TODO: @SDV Try to find a better way to do this
  removeField(field: Field) {
    const shareableFields = this.shareableFields.data;
    const selectedFields = this.selectedFields.data;
    shareableFields.push(field);
    selectedFields.splice(selectedFields.indexOf(field), 1);
    this.shareableFields.data = shareableFields;
    this.selectedFields.data = selectedFields;
  }

  save() {
    this.dialogRef.close(this.selectedFields.data || []);
  }

  closeDialog() {
    this.dialogRef.close([]);
  }
}

export interface AppSharingFieldsViewModel {
  shareableFields: Field[];
  selectedFields: Field[];
}
