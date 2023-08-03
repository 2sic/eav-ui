import { Component, HostBinding, OnInit } from '@angular/core';
import { UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { FileLocationFormValues } from '..';

@Component({
  selector: 'app-file-location-dialog',
  templateUrl: './file-location-dialog.component.html',
  styleUrls: ['./file-location-dialog.component.scss']
})
export class FileLocationDialogComponent implements OnInit {
  @HostBinding('className') hostClass = 'dialog-component';

  form: UntypedFormGroup;

  constructor(private dialogRef: MatDialogRef<FileLocationDialogComponent>) { }

  ngOnInit(): void {
    this.form = new UntypedFormGroup({
      isShared: new UntypedFormControl(null, Validators.required),
    });
  }

  closeDialog(isShared?: boolean): void {
    this.dialogRef.close(isShared);
  }

  confirm(): void {
    const formValues: FileLocationFormValues = this.form.getRawValue();
    this.closeDialog(formValues.isShared);
  }
}
