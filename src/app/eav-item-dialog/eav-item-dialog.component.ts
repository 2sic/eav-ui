import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';

import * as itemActions from '../shared/store/actions/item.actions';
import { EavItemService } from '../shared/services/eav-item.service';
import { AppState } from '../shared/models';
import { EavItem } from '../shared/models/eav';

@Component({
  selector: 'app-eav-item-dialog',
  templateUrl: './eav-item-dialog.component.html',
  styleUrls: ['./eav-item-dialog.component.css']
})
export class EavItemDialogComponent implements OnInit {
  // Test
  item$: Observable<EavItem>;

  constructor(private store: Store<AppState>,
    private eavItemService: EavItemService) { }

  ngOnInit() {
    this.loadItem();

    // Test
    this.item$ = this.store.select(state => state.items);
  }

  /**
   *  Call action to Load eav item to store
   */
  loadItem() {
    this.store.dispatch(new itemActions.LoadEavItemsAction());
  }
}
