import { DatePipe } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatExpansionModule } from '@angular/material/expansion';
import { HistoryItem } from './models/history-item.model';

@Component({
  selector: 'app-history-item',
  templateUrl: './history-item.html',
  styleUrls: ['./item-history.scss'],
  imports: [
    MatButtonModule,
    MatExpansionModule,
    DatePipe,
  ]
})
export class HistoryItemComponent {
  @Input() historyItem!: HistoryItem;
  @Input() isExpanded!: boolean;
  @Input() expandedAttributes!: Record<string, boolean>;
  
  @Output() panelExpandedChange = new EventEmitter<boolean>();
  @Output() attributeToggle = new EventEmitter<string>();
  @Output() restore = new EventEmitter<number>();

  getLocalDate(date: string) {
    return new Date(date);
  }

  onExpandedChange(expanded: boolean) {
    this.panelExpandedChange.emit(expanded);
  }

  onAttributeToggle(attributeName: string) {
    this.attributeToggle.emit(attributeName);
  }

  onRestore() {
    this.restore.emit(this.historyItem.changeSetId);
  }
}
