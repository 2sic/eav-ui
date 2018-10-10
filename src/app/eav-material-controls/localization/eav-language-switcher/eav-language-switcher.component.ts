import { Component, Input } from '@angular/core';
import { MatTabChangeEvent, DialogPosition } from '@angular/material';
import { MatDialog, MatDialogRef } from '@angular/material';

import { Language } from '../../../shared/models/eav';
import { LanguageService } from '../../../shared/services/language.service';
import { SaveStatusDialogComponent } from '../../dialogs/save-status-dialog/save-status-dialog.component';
import { AdminDialogData } from '../../../shared/models/eav/admin-dialog-data';
import { DialogTypeConstants } from '../../../shared/constants/type-constants';
import { MultiItemEditFormComponent } from '../../../eav-item-dialog/multi-item-edit-form/multi-item-edit-form.component';

@Component({
  selector: 'app-eav-language-switcher',
  templateUrl: './eav-language-switcher.component.html',
  styleUrls: ['./eav-language-switcher.component.scss']
})
export class EavLanguageSwitcherComponent {
  @Input() languages: Language[];

  @Input() currentLanguage: string;

  @Input() formsAreValid: boolean;

  // publishMode = 'hide';    // has 3 modes: show, hide, branch (where branch is a hidden, linked clone)
  versioningOptions;

  get publishMode() {
    return this.multiFormDialogRef.componentInstance.publishMode;
  }

  constructor(private languageService: LanguageService,
    public multiFormDialogRef: MatDialogRef<MultiItemEditFormComponent>,
    private dialog: MatDialog) {
    // this.currentLanguage$ = languageService.getCurrentLanguage();
  }

  closeDialog() {
    this.multiFormDialogRef.componentInstance.closeDialog();
  }

  /**
   * on select tab changed update current language in store
   * @param language
   */
  selectLanguage(language: Language) {
    this.languageService.updateCurrentLanguage(language.key);
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

    dialogRef.componentInstance.publishMode = this.multiFormDialogRef.componentInstance.publishMode;
    // Close dialog
    dialogRef.afterClosed().subscribe(result => {
      this.multiFormDialogRef.componentInstance.publishMode = dialogRef.componentInstance.publishMode;
    });
  }
}
