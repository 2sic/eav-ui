import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';

import * as itemActions from '../../shared/store/actions/item.actions';
import * as contentTypeActions from '../../shared/store/actions/content-type.actions';
import { AppState } from '../../shared/models';
import { Item, ContentType } from '../../shared/models/eav';

@Component({
  selector: 'app-multi-item-edit-form',
  templateUrl: './multi-item-edit-form.component.html',
  styleUrls: ['./multi-item-edit-form.component.css']
})
export class MultiItemEditFormComponent implements OnInit {
  // Test
  items$: Observable<Item[]>;
  // contentTypes$: Observable<ContentType[]>;

  constructor(private store: Store<AppState>) { }

  ngOnInit() {
    this.loadItem();
    this.loadcontentType();
    this.items$ = this.store.select(state => state.items);
    // this.contentTypes$ = this.store.select(state => state.contentTypes);
  }

  /**
   *  Call action to Load item to store
   */
  loadItem() {
    this.store.dispatch(new itemActions.LoadItemsAction());
  }

  /**
  *  Call action to Load item to store
  */
  loadcontentType() {
    this.store.dispatch(new contentTypeActions.LoadContentTypeAction());
  }
}

