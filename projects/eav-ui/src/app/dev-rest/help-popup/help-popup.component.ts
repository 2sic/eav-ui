import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { HelpPopupData } from './help-popup.models';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { TippyStandaloneDirective } from '../../shared/directives/tippy-Standalone.directive';

@Component({
    selector: 'app-help-popup',
    templateUrl: './help-popup.component.html',
    standalone: true,
    imports: [
        MatButtonModule,
        TippyStandaloneDirective,
        MatIconModule,
    ],
})
export class HelpPopupComponent implements OnInit {

  constructor(private dialogRef: MatDialogRef<HelpPopupComponent>, @Inject(MAT_DIALOG_DATA) public dialogData: HelpPopupData) { }

  ngOnInit() {
  }

  closeDialog() {
    this.dialogRef.close();
  }
}
