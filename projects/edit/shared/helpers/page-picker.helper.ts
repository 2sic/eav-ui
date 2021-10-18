import { ChangeDetectorRef, ViewContainerRef } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { take } from 'rxjs/operators';
import { PagePickerResult } from '../../../edit-types';
import { FieldConfigSet } from '../../form/builder/fields-builder/field-config-set.model';
import { PagePickerComponent } from '../../form/shared/page-picker/page-picker.component';
import { PagePickerDialogData } from '../../form/shared/page-picker/page-picker.models';

export class PagePicker {
  static open(
    config: FieldConfigSet,
    group: FormGroup,
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
      width: '650px',
    });

    dialogRef.afterClosed().pipe(take(1)).subscribe((value: PagePickerResult) => {
      callback(value);
    });

    changeDetectorRef.markForCheck();
  }
}
