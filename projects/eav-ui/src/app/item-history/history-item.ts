import { DatePipe } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatExpansionModule } from '@angular/material/expansion';
import { HistoryItem } from './models/history-item.model';

@Component({
  selector: 'app-history-item',
  standalone: true,
  templateUrl: './history-item.html',
  styleUrls: ['./item-history.scss'],
  imports: [
    MatButtonModule,
    MatExpansionModule,
    DatePipe,
  ]
})
export class HistoryItemComponent {
  @Input({ required: true }) historyItem!: HistoryItem;
  @Input() expanded = false;
  @Output() expandedChange = new EventEmitter<boolean>();
  @Output() restore = new EventEmitter<number>();

  expandedAttributes: Record<string, boolean> = {};
  
  getLocalDate(date: string) {
    return new Date(date);
  }

  toggleAttribute(attributeName: string) {
    const key = this.historyItem.versionNumber + attributeName;
    this.expandedAttributes[key] = !this.expandedAttributes[key];
  }

  onRestore() {
    this.restore.emit(this.historyItem.changeSetId);
  }
}