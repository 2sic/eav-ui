import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { HistoryItemComponent } from '../../item-history/history-item';
import { HistoryItem } from '../../item-history/models/history-item.model';

@Component({
  selector: 'app-single-history-dialog',
  standalone: true,
  imports: [
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    HistoryItemComponent
  ],
  templateUrl: './single-history-dialog.html'
})
export class SingleHistoryDialogComponent {
  historyItem = inject(MAT_DIALOG_DATA) as HistoryItem | null;
}
