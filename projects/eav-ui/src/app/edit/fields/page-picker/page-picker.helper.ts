import { ChangeDetectorRef, ViewContainerRef } from '@angular/core';
import { UntypedFormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { take } from 'rxjs';
import { PagePickerResult } from '../../../../../../edit-types';
import { PagePickerComponent } from './page-picker.component';
import { PagePickerDialogData } from './page-picker.models';
import { FieldConfigSet } from '../field-config-set.model';

export class PagePicker {
  static open(
    config: FieldConfigSet,
    group: UntypedFormGroup,
    dialog: MatDialog,
    viewContainerRef: ViewContainerRef,
    changeDetectorRef: ChangeDetectorRef,
    callback: (value: PagePickerResult) => void,
  ): void {
    const dialogData: PagePickerDialogData = {
      config,
      group,
    };
    const dialogRef = dialog.open(PagePickerComponent, {
      autoFocus: false,
      data: dialogData,
      viewContainerRef,
      height: '80%',
      width: '650px',
    });

    dialogRef.afterClosed().pipe(take(1)).subscribe((value: PagePickerResult) => {
      callback(value);
    });

    changeDetectorRef.markForCheck();
  }
}
