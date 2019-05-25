import { Component, OnInit, Input } from '@angular/core';
import { MatDialogRef, MatDialog } from '@angular/material';

import { Language } from '../../shared/models/eav';
import { MultiItemEditFormComponent } from '../multi-item-edit-form/multi-item-edit-form.component';
import { SaveStatusDialogComponent } from '../../eav-material-controls/dialogs/save-status-dialog/save-status-dialog.component';

@Component({
  selector: 'app-multi-item-edit-form-header',
  templateUrl: './multi-item-edit-form-header.component.html',
  styleUrls: ['./multi-item-edit-form-header.component.scss']
})
export class MultiItemEditFormHeaderComponent implements OnInit {
  @Input() languages: Language[];

  @Input() currentLanguage: string;

  @Input() formsAreValid: boolean;

  @Input() allControlsAreDisabled: boolean;
  @Input() isParentDialog: boolean;

  constructor(public multiFormDialogRef: MatDialogRef<MultiItemEditFormComponent>, private dialog: MatDialog) { }

  ngOnInit() { }

  // publishMode = 'hide';    // has 3 modes: show, hide, branch (where branch is a hidden, linked clone)
  get publishMode() {
    return this.multiFormDialogRef.componentInstance.publishMode;
  }

  closeDialog() {
    this.multiFormDialogRef.componentInstance.closeDialog();
  }

  public openSaveSatusDialog() {
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
