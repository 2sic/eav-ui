import { Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { HistoryItemComponent } from '../../item-history/history-item';
import { HistoryItem } from '../../item-history/models/history-item.model';
import { DialogHeaderComponent } from "../../shared/dialog-header/dialog-header";

@Component({
  selector: 'app-single-history-dialog',
  templateUrl: './single-history-dialog.html',
  styleUrls: ['./single-history-dialog.scss'],
  standalone: true,
  imports: [
    HistoryItemComponent,
    DialogHeaderComponent
  ],
})
export class SingleHistoryDialogComponent {
  historyItem = inject(MAT_DIALOG_DATA) as HistoryItem | null;
  
  dialog = inject(MatDialogRef<{}>);
}