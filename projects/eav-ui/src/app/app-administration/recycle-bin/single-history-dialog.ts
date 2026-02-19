import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { HistoryItemComponent } from '../../item-history/history-item';
import { HistoryItem } from '../../item-history/models/history-item.model';

@Component({
  selector: 'app-single-history-dialog',
  styleUrls: ['single-history-dialog.scss'],
  standalone: true,
  imports: [
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    HistoryItemComponent
  ],
  template: `
    <div class="single-history-dialog-header">
      <span class="dialog-initial-focus" cdkFocusInitial tabindex="-1"></span>
      <h2 class="single-history-dialog-title">History Details</h2>
      <button mat-icon-button mat-dialog-close class="single-history-dialog-close-btn" tippy="Close">
        <mat-icon>close</mat-icon>
      </button>
    </div>
    <mat-dialog-content class="single-history-dialog-content">
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
  `
})
export class SingleHistoryDialogComponent {
  historyItem = inject(MAT_DIALOG_DATA) as HistoryItem | null;
}
