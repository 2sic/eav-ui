import { ChangeDetectorRef, ViewContainerRef } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { take } from 'rxjs/operators';
import { PagePickerResult } from '../../../edit-types';
import { FieldConfigSet } from '../../eav-dynamic-form/model/field-config';
import { PagePickerComponent } from '../../eav-material-controls/page-picker/page-picker.component';
import { PagePickerDialogData } from '../../eav-material-controls/page-picker/page-picker.models';

export class PagePicker {
  static open(
    config: FieldConfigSet,
    group: FormGroup,
    dialog: MatDialog,
    viewContainerRef: ViewContainerRef,
    changeDetectorRef: ChangeDetectorRef,
    callback: (value: PagePickerResult) => void,
  ): void {
    const data: PagePickerDialogData = {
      config,
      group,
    };
    const dialogRef = dialog.open(PagePickerComponent, {
      autoFocus: false,
      data,
      viewContainerRef,
      width: '650px',
    });

    dialogRef.afterClosed().pipe(take(1)).subscribe((value: PagePickerResult) => {
      callback(value);
    });

    changeDetectorRef.markForCheck();
  }
}
