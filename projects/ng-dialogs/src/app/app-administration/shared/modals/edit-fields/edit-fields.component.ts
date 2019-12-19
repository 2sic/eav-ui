import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

import { EditFieldsDialogData } from '../../models/edit-fields-dialog-data.model';

@Component({
  selector: 'app-edit-fields',
  templateUrl: './edit-fields.component.html',
  styleUrls: ['./edit-fields.component.scss']
})
export class EditFieldsComponent implements OnInit {
  constructor(
    private dialogRef: MatDialogRef<EditFieldsComponent>,
    @Inject(MAT_DIALOG_DATA) public editFieldsDialogData: EditFieldsDialogData,
  ) { }

  ngOnInit() {
  }
}
