import { Component, HostBinding, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatOptionModule } from '@angular/material/core';
import { MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { FileLocationFormValues } from '..';
import { FieldHintComponent } from '../../shared/components/field-hint/field-hint';

@Component({
  selector: 'app-file-location-dialog',
  templateUrl: './file-location-dialog.html',
  styleUrls: ['./file-location-dialog.scss'],
  imports: [
    MatCardModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatOptionModule,
    MatButtonModule,
    FieldHintComponent,
  ]
})
export class FileLocationDialogComponent implements OnInit {
  @HostBinding('className') hostClass = 'dialog-component';

  form: UntypedFormGroup;

  constructor(private dialog: MatDialogRef<FileLocationDialogComponent>) { }

  ngOnInit(): void {
    this.form = new UntypedFormGroup({
      isShared: new UntypedFormControl(null, Validators.required),
    });
  }

  closeDialog(isShared?: boolean): void {
    this.dialog.close(isShared);
  }

  confirm(): void {
    const formValues: FileLocationFormValues = this.form.getRawValue();
    this.closeDialog(formValues.isShared);
  }
}
