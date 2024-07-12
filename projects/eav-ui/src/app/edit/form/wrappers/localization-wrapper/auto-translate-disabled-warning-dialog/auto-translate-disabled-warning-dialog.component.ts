import { Component, Inject, Input, OnDestroy, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { TranslateModule } from '@ngx-translate/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';

@Component({
    selector: 'app-auto-translate-disabled-warning-dialog',
    templateUrl: './auto-translate-disabled-warning-dialog.component.html',
    styleUrls: ['./auto-translate-disabled-warning-dialog.component.scss'],
    standalone: true,
    imports: [
        MatCardModule,
        MatButtonModule,
        TranslateModule,
    ],
})
export class AutoTranslateDisabledWarningDialog implements OnInit {
  // @Input() public isAutoTranslateAll: boolean;

  constructor(
    private dialogRef: MatDialogRef<AutoTranslateDisabledWarningDialog>,
    @Inject(MAT_DIALOG_DATA) public dialogData: any,
  ) {
  }

  ngOnInit(): void {
  }

  closeDialog() {
    this.dialogRef.close();
  }
}