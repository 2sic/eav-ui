import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { HistoryItemComponent } from '../../item-history/history-item';
import { HistoryItem } from '../../item-history/models/history-item.model';

@Component({
  selector: 'app-single-history-dialog',
  standalone: true,
  imports: [
    MatDialogModule,
    MatButtonModule,
    HistoryItemComponent
  ],
  template: `
    <h2 mat-dialog-title>
        History Details
    </h2>

    <mat-dialog-content>
      @if (historyItem) {
        <app-history-item
          [historyItem]="historyItem"
          [expanded]="true"
        />
      }
      @else {
        <p>No history data available.</p>
      }
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>
        Close
      </button>
    </mat-dialog-actions>
  `
})
export class SingleHistoryDialogComponent {
  historyItem = inject(MAT_DIALOG_DATA) as HistoryItem | null;
}
