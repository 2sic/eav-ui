import { ChangeDetectorRef, ViewContainerRef } from '@angular/core';
import { UntypedFormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { take } from 'rxjs';
import { PagePickerResult } from '../../../../../../edit-types/src/PagePickerResult';
import { FieldConfigSet } from '../field-config-set.model';
import { PagePickerComponent } from './page-picker';
import { PagePickerDialogData } from './page-picker.models';

export class PagePicker {
  static open(
    config: FieldConfigSet,
    group: UntypedFormGroup,
    matDialog: MatDialog,
    viewContainerRef: ViewContainerRef,
    changeDetectorRef: ChangeDetectorRef,
    callback: (value: PagePickerResult) => void,
  ): void {
    const dialogData: PagePickerDialogData = {
      config,
      group,
    };
    const dialogRef = matDialog.open(PagePickerComponent, {
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
