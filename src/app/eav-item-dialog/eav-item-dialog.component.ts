import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';

import { AppState, Item, ContentType } from '../models';
import * as itemActions from '../actions/item.actions';
import * as contentTypeActions from '../actions/content-type.actions';

@Component({
  selector: 'app-eav-item-dialog',
  templateUrl: './eav-item-dialog.component.html',
  styleUrls: ['./eav-item-dialog.component.css']
})
export class EavItemDialogComponent implements OnInit {
  items$: Observable<Item[]>;
  contentTypes$: Observable<ContentType[]>;

  constructor(private store: Store<AppState>) { }

  ngOnInit() {
    this.loadItems();
    this.items$ = this.store.select(state => state.items);
    this.loadContentTypes();
    this.contentTypes$ = this.store.select(state => state.contentTypes);
    this.loadItemsSuccess();
    this.loadContentTypesSuccess();
  }

  loadItems() {
    this.store.dispatch(new itemActions.LoadItemsAction());
  }

  loadItemsSuccess() {
    this.store.dispatch(new itemActions.LoadItemsSuccessAction([{ id: 100, name: 'Items success' }]));
  }

  loadContentTypes() {
    this.store.dispatch(new contentTypeActions.LoadContentTypeAction());
  }

  loadContentTypesSuccess() {
    this.store.dispatch(new contentTypeActions.LoadContentTypeSuccessAction([{ id: 101, name: 'ContentTypes success' }]));
  }
}
