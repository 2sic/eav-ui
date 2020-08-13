import { Component, OnInit, Input, ChangeDetectionStrategy } from '@angular/core';
import { MatDialogRef, MatDialog } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { MultiItemEditFormComponent } from '../multi-item-edit-form/multi-item-edit-form.component';
import { SaveStatusDialogComponent } from '../../eav-material-controls/dialogs/save-status-dialog/save-status-dialog.component';
import { LanguageService } from '../../shared/store/ngrx-data/language.service';

@Component({
  selector: 'app-multi-item-edit-form-header',
  templateUrl: './multi-item-edit-form-header.component.html',
  styleUrls: ['./multi-item-edit-form-header.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MultiItemEditFormHeaderComponent implements OnInit {
  @Input() formId: number;
  @Input() formsAreValid: boolean;
  @Input() allControlsAreDisabled: boolean;
  @Input() isParentDialog: boolean;
  @Input() publishMode: boolean;

  hasLanguages$: Observable<boolean>;

  constructor(
    private multiFormDialogRef: MatDialogRef<MultiItemEditFormComponent, any>,
    private dialog: MatDialog,
    private languageService: LanguageService,
  ) { }

  ngOnInit() {
    this.hasLanguages$ = this.languageService.entities$.pipe(map(languages => languages.length > 0));
  }

  closeDialog() {
    this.multiFormDialogRef.componentInstance.closeDialog();
  }

  openSaveStatusDialog() {
    const dialogRef = this.dialog.open(SaveStatusDialogComponent, {
      panelClass: 'c-save-status-dialog',
      autoFocus: false,
      width: '350px',
    });
    dialogRef.keydownEvents().subscribe(e => {
      if (e.keyCode === 83 && (navigator.platform.match('Mac') ? e.metaKey : e.ctrlKey)) {
        e.preventDefault(); // CTRL + S
      }
    });

    dialogRef.componentInstance.publishMode = this.multiFormDialogRef.componentInstance.publishMode$.value;

    dialogRef.afterClosed().subscribe(result => {
      this.multiFormDialogRef.componentInstance.publishMode$.next(dialogRef.componentInstance.publishMode);
    });
  }
}
