import { Component, Input } from '@angular/core';
import { MatTabChangeEvent, DialogPosition } from '@angular/material';
import { MatDialog, MatDialogRef } from '@angular/material';

import { Language } from '../../../shared/models/eav';
import { LanguageService } from '../../../shared/services/language.service';
import { SaveStatusDialogComponent } from '../../dialogs/save-status-dialog/save-status-dialog.component';
import { AdminDialogData } from '../../../shared/models/eav/admin-dialog-data';
import { DialogTypeConstants } from '../../../shared/constants/type-constants';

@Component({
  selector: 'app-eav-language-switcher',
  templateUrl: './eav-language-switcher.component.html',
  styleUrls: ['./eav-language-switcher.component.scss']
})
export class EavLanguageSwitcherComponent {
  @Input() languages: Language[];

  @Input() currentLanguage: string;

  @Input() formsAreValid: boolean;

  publishMode = 'hide';    // has 3 modes: show, hide, branch (where branch is a hidden, linked clone)
  versioningOptions;

  constructor(private languageService: LanguageService,
    private dialog: MatDialog) {
    // this.currentLanguage$ = languageService.getCurrentLanguage();
  }

  /**
   * on select tab changed update current language in store
   * @param event
   */
  // selectedTabChanged(tabChangeEvent: MatTabChangeEvent) {
  //   const language: Language = this.getLanguageByName(tabChangeEvent.tab.textLabel);
  //   this.languageService.updateCurrentLanguage(language.key);
  // }

  /**
   * on select tab changed update current language in store
   * @param language
   */
  selectLanguage(language: Language) {
    this.languageService.updateCurrentLanguage(language.key);
  }

  // private getLanguageByName = (name): Language => {
  //   return this.languages.find(d => d.name.startsWith(name));
  // }

  // private getLanguage = (key): Language => {
  //   return this.languages.find(d => d.key === key);
  // }

  public openSaveSatusDialog() {
    // Open dialog
    const dialogRef = this.dialog.open(SaveStatusDialogComponent, {
      panelClass: 'c-save-status-dialog',
      autoFocus: false,
      width: '350px',
      // height: '80vh',
      // position: <DialogPosition>{ top: '10px', bottom: '10px' , left: '24px', right: '24px'},
      data: <AdminDialogData>{
        dialogType: DialogTypeConstants.itemEditWithEntityId,
        item: 'temp'
      }
    });

    // Close dialog
    dialogRef.afterClosed().subscribe(result => {
      console.log('SaveStatusDialogComponent1 afterClosed', result);
    });
  }
}
