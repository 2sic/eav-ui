import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';

import * as itemActions from '../shared/store/actions/item.actions';
import * as contentTypeActions from '../shared/store/actions/content-type.actions';
import { ContentTypeService } from '../shared/services/content-type.service';
import { AppState } from '../shared/models';
import { Item, ContentType } from '../shared/models/eav';

@Component({
  selector: 'app-eav-item-dialog',
  templateUrl: './eav-item-dialog.component.html',
  styleUrls: ['./eav-item-dialog.component.css']
})
export class EavItemDialogComponent implements OnInit {
  // Test
  items$: Observable<Item[]>;
  contentTypes$: Observable<ContentType[]>;

  constructor(private store: Store<AppState>, private contentTypeService: ContentTypeService) { }

  ngOnInit() {
    // Test
    this.loadItem();
    this.loadcontentType();
    this.items$ = this.store.select(state => state.items);
    this.contentTypes$ = this.store.select(state => state.contentTypes);
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
