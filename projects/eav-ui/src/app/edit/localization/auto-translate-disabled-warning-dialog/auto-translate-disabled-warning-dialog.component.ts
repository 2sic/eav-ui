import { Component, Inject, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { TranslateModule } from '@ngx-translate/core';

@Component({
    selector: 'app-auto-translate-disabled-warning-dialog',
    templateUrl: './auto-translate-disabled-warning-dialog.component.html',
    imports: [
        MatCardModule,
        MatButtonModule,
        TranslateModule,
    ]
})
export class AutoTranslateDisabledWarningDialog implements OnInit {
  constructor(
    private dialog: MatDialogRef<AutoTranslateDisabledWarningDialog>,
    @Inject(MAT_DIALOG_DATA) public dialogData: any,
  ) { }

  ngOnInit(): void { }

  closeDialog() {
    this.dialog.close();
  }
}