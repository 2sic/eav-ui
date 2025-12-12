import { Component, Inject, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { TippyDirective } from '../../shared/directives/tippy.directive';
import { HelpPopupData } from './help-popup.models';

@Component({
    selector: 'app-help-popup',
    templateUrl: './help-popup.html',
    imports: [
        MatButtonModule,
        TippyDirective,
        MatIconModule,
    ]
})
export class HelpPopupComponent implements OnInit {

  constructor(
    private dialog: MatDialogRef<HelpPopupComponent>,
    @Inject(MAT_DIALOG_DATA) public dialogData: HelpPopupData
  ) { }

  ngOnInit() {
  }

  closeDialog() {
    this.dialog.close();
  }
}
