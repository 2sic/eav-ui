import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

import { EditContentTypeDialogData } from '../../models/edit-content-type-dialog-data.model';
import { ContentTypeEdit } from '../../models/content-type.model';
import { EavConfigurationService } from '../../services/eav-configuration.service';
import { ContentTypesService } from '../../services/content-types.service';

@Component({
  selector: 'app-edit-content-type',
  templateUrl: './edit-content-type.component.html',
  styleUrls: ['./edit-content-type.component.scss']
})
export class EditContentTypeComponent implements OnInit {
  contentType: ContentTypeEdit;
  isNew: boolean;

  constructor(
    private dialogRef: MatDialogRef<EditContentTypeComponent>,
    @Inject(MAT_DIALOG_DATA) public editContentTypeDialogData: EditContentTypeDialogData,
    private eavConfigurationService: EavConfigurationService,
    private contentTypesService: ContentTypesService,
  ) { }

  ngOnInit() {
    if (!this.editContentTypeDialogData.contentType) {
      this.isNew = true;
      this.contentType = {
        ...this.editContentTypeDialogData.contentType,
        StaticName: '',
        Name: '',
        Description: '',
        Scope: this.eavConfigurationService.contentType.defaultScope,
        ChangeStaticName: false,
        NewStaticName: '',
      };
    } else {
      this.isNew = false;
      this.contentType = {
        ...this.editContentTypeDialogData.contentType,
        ChangeStaticName: false,
        NewStaticName: '',
      };
    }
  }

  onSubmit() {
    this.contentTypesService.save(this.contentType, this.editContentTypeDialogData.context.appId).subscribe((result: boolean) => {
      this.closeDialog();
    });
  }

  closeDialog() {
    this.dialogRef.close();
  }

}
