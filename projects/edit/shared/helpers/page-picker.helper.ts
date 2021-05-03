import { ChangeDetectorRef, ViewContainerRef } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { take } from 'rxjs/operators';
import { PagePickerResult } from '../../../edit-types';
import { PagePickerComponent } from '../../eav-material-controls/page-picker/page-picker.component';

export class PagePicker {
  static open(
    dialog: MatDialog,
    viewContainerRef: ViewContainerRef,
    changeDetectorRef: ChangeDetectorRef,
    callback: (value: PagePickerResult) => void,
  ): void {
    const dialogRef = dialog.open(PagePickerComponent, {
      autoFocus: false,
      viewContainerRef,
      width: '650px',
    });

    dialogRef.afterClosed().pipe(take(1)).subscribe((value: PagePickerResult) => {
      callback(value);
    });

    changeDetectorRef.markForCheck();
  }
}
