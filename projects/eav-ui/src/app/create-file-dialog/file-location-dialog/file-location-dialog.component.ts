import { Component, HostBinding, OnInit } from '@angular/core';
import { UntypedFormControl, UntypedFormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { FileLocationFormValues } from '..';
import { MatButtonModule } from '@angular/material/button';
import { SharedComponentsModule } from '../../shared/shared-components.module';
import { MatOptionModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-file-location-dialog',
  templateUrl: './file-location-dialog.component.html',
  styleUrls: ['./file-location-dialog.component.scss'],
  standalone: true,
  imports: [MatCardModule, FormsModule, ReactiveFormsModule, MatFormFieldModule, MatSelectModule, MatOptionModule, SharedComponentsModule, MatButtonModule]
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
