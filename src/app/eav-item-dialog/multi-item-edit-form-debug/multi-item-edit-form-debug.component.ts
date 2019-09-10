import { Component, OnInit, Output, EventEmitter } from '@angular/core';

import { ItemService } from '../../shared/services/item.service';
import { ItemService2 } from '../../shared/store/ngrx-data/item.service';
import { Observable, Subscription } from 'rxjs';
import { Item } from '../../shared/models/eav';

@Component({
  selector: 'app-multi-item-edit-form-debug',
  templateUrl: './multi-item-edit-form-debug.component.html',
  styleUrls: ['./multi-item-edit-form-debug.component.scss']
})
export class MultiItemEditFormDebugComponent implements OnInit {
  @Output() debugInfoOpened: EventEmitter<boolean> = new EventEmitter<boolean>();

  showDebugInfo = false;
  items$: Observable<Item[]>;
  items: Item[] = [];
  subscriptions: Subscription[] = [];

  constructor(
    private itemService: ItemService,
    private itemService2: ItemService2,
  ) { }

  ngOnInit() {
    this.items$ = this.itemService.selectAllItems();
    this.items$ = this.itemService2.selectAllItems();
    this.subscriptions.push(
      this.items$.subscribe(items => {
        this.items = items;
      })
    );
  }

  toggleDebugInfo() {
    this.showDebugInfo = !this.showDebugInfo;
    this.debugInfoOpened.emit(this.showDebugInfo);
  }
}
