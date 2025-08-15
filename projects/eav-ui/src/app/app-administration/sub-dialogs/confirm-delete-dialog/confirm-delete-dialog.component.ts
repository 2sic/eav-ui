import { Component, HostBinding, Inject, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { isCtrlEnter } from '../../../edit/dialog/main/keyboard-shortcuts';
import { SafeHtmlPipe } from '../../../shared/pipes/safe-html.pipe';
import { ConfirmDeleteDialogData } from './confirm-delete-dialog.models';

@Component({
  selector: 'app-confirm-delete-dialog',
  templateUrl: './confirm-delete-dialog.component.html',
  styleUrls: ['./confirm-delete-dialog.component.scss'],
  imports: [
    MatCardModule,
    MatButtonModule,
    SafeHtmlPipe,
  ]
})
export class ConfirmDeleteDialogComponent implements OnInit {
  @HostBinding('className') hostClass = 'dialog-component';

  constructor(
    @Inject(MAT_DIALOG_DATA) public dialogData: ConfirmDeleteDialogData,
    public dialog: MatDialogRef<ConfirmDeleteDialogComponent>,
  ) { }

  ngOnInit() {
    this.#watchKeyboardShortcuts();
  }

  #watchKeyboardShortcuts(): void {
    this.dialog.keydownEvents().subscribe(event => {
      if (isCtrlEnter(event)) {
        event.preventDefault();
        this.dialog.close(true);
      }
    });
  }
}
