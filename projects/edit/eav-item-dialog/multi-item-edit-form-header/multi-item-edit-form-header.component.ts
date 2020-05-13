import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { MatDialogRef, MatDialog } from '@angular/material/dialog';
import { Subscription } from 'rxjs';

import { Language } from '../../shared/models/eav';
import { MultiItemEditFormComponent } from '../multi-item-edit-form/multi-item-edit-form.component';
import { SaveStatusDialogComponent } from '../../eav-material-controls/dialogs/save-status-dialog/save-status-dialog.component';
import { LanguageService } from '../../shared/store/ngrx-data/language.service';

@Component({
  selector: 'app-multi-item-edit-form-header',
  templateUrl: './multi-item-edit-form-header.component.html',
  styleUrls: ['./multi-item-edit-form-header.component.scss']
})
export class MultiItemEditFormHeaderComponent implements OnInit, OnDestroy {
  @Input() formId: number;
  @Input() formsAreValid: boolean;
  @Input() allControlsAreDisabled: boolean;
  @Input() isParentDialog: boolean;

  private subscriptions: Subscription[] = [];
  languages: Language[];

  constructor(
    public multiFormDialogRef: MatDialogRef<MultiItemEditFormComponent, any>,
    private dialog: MatDialog,
    private languageService: LanguageService,
  ) { }

  ngOnInit() {
    this.subscriptions.push(
      this.languageService.entities$.subscribe(languages => { this.languages = languages; }),
    );
  }

  ngOnDestroy() {
    this.subscriptions.forEach(subscription => { subscription.unsubscribe(); });
  }

  // has 3 modes: show, hide, branch (where branch is a hidden, linked clone)
  get publishMode() {
    return this.multiFormDialogRef.componentInstance.publishMode;
  }

  closeDialog() {
    this.multiFormDialogRef.componentInstance.closeDialog();
  }

  public openSaveStatusDialog() {
    // Open dialog
    const dialogRef = this.dialog.open(SaveStatusDialogComponent, {
      panelClass: 'c-save-status-dialog',
      autoFocus: false,
      width: '350px',
      // height: '80vh',
      // position: <DialogPosition>{ top: '10px', bottom: '10px' , left: '24px', right: '24px'},
    });
    // spm add dialog and subdialog events through a helper
    dialogRef.keydownEvents().subscribe(e => {
      // CTRL + S
      if (e.keyCode === 83 && (navigator.platform.match('Mac') ? e.metaKey : e.ctrlKey)) {
        e.preventDefault(); // spm don't open browser default save
      }
    });

    dialogRef.componentInstance.publishMode = this.multiFormDialogRef.componentInstance.publishMode;
    // Close dialog
    dialogRef.afterClosed().subscribe(result => {
      this.multiFormDialogRef.componentInstance.publishMode = dialogRef.componentInstance.publishMode;
    });
  }
}
