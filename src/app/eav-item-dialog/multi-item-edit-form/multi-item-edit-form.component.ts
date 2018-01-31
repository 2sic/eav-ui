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
    // this.loadItem();
    // this.loadcontentType();
    this.items$ = this.store.select(state => state.items);
  }

  /**
   *  Call action to Load item to store
   */
  loadItem() {
    // this.store.dispatch(new itemActions.LoadItemsAction('json-item-v1-accordion.json'));
    this.store.dispatch(new itemActions.LoadItemsAction('json-item-v1-person.json'));
  }

  /**
  *  Call action to Load content type to store
  */
  loadcontentType() {
    // this.store.dispatch(new contentTypeActions.LoadContentTypeAction('json-content-type-v1-accordion.json'));
    this.store.dispatch(new contentTypeActions.LoadContentTypeAction('json-content-type-v1-person.json'));
  }

  // Test
  loadAccordion() {
    this.store.dispatch(new itemActions.LoadItemsAction('json-item-v1-accordion.json'));
    this.store.dispatch(new contentTypeActions.LoadContentTypeAction('json-content-type-v1-accordion.json'));
    this.items$ = this.store.select(state => state.items);
    console.log('load accordion');
  }

  // Test
  loadPerson() {
    this.store.dispatch(new itemActions.LoadItemsAction('json-item-v1-person.json'));
    this.store.dispatch(new contentTypeActions.LoadContentTypeAction('json-content-type-v1-person.json'));
    this.items$ = this.store.select(state => state.items);
    console.log('load persons');
  }
}

