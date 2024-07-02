import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { HelpPopupData } from './help-popup.models';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { TippyDirective } from '../../shared/directives/tippy.directive';

@Component({
    selector: 'app-help-popup',
    templateUrl: './help-popup.component.html',
    standalone: true,
    imports: [
        MatButtonModule,
        TippyDirective,
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
