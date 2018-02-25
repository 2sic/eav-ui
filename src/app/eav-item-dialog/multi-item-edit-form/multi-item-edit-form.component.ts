import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';


import * as contentTypeActions from '../../shared/store/actions/content-type.actions';
import { AppState } from '../../shared/models';
import { Item, ContentType } from '../../shared/models/eav';
import { of } from 'rxjs/observable/of';
import { ItemService } from '../../shared/services/item.service';
import { ContentTypeService } from '../../shared/services/content-type.service';

import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

@Component({
  selector: 'app-multi-item-edit-form',
  templateUrl: './multi-item-edit-form.component.html',
  styleUrls: ['./multi-item-edit-form.component.css']
})
export class MultiItemEditFormComponent implements OnInit {
  // Test
  items$: Observable<Item[]>;
  // contentTypes$: Observable<ContentType[]>;

  constructor(private itemService: ItemService, private contentTypeService: ContentTypeService, private dialog: MatDialog) {
    this.items$ = itemService.items$;
  }

  ngOnInit() {
    // this.loadItem();
    // this.loadcontentType();
    // this.items$ = this.store.select(state => state.items);
  }

  /**
   *  Call action to Load item to store
   */
  // loadItem() {
  //   // this.store.dispatch(new itemActions.LoadItemsAction('json-item-v1-accordion.json'));
  //   this.itemService.loadItem('json-item-v1-person.json');
  // }

  /**
  *  Call action to Load content type to store
  */
  // loadcontentType() {
  //   // this.store.dispatch(new contentTypeActions.LoadContentTypeAction('json-content-type-v1-accordion.json'));
  //   this.contentTypeService.loadContentType('json-content-type-v1-person.json');
  // }

  // Test
  loadAccordion() {
    this.itemService.loadItem('json-item-v1-accordion.json');
    this.contentTypeService.loadContentType('json-content-type-v1-accordion.json');
    // this.items$ = this.store.select(state => state.items);
    console.log('load accordion');
  }

  // Test
  loadPerson() {
    this.itemService.loadItem('json-item-v1-person.json');
    this.contentTypeService.loadContentType('json-content-type-v1-person.json');
    // this.items$ = this.store.select(state => state.items);
    console.log('load persons');
  }

  // Test
  loadStringInputTypes() {
    this.itemService.loadItem('json-item-v1-string-input-types.json');
    this.contentTypeService.loadContentType('json-content-type-v1-string-input-types.json');
    // this.items$ = this.store.select(state => state.items);
    console.log('load string content types');
  }

  // Test
  loadInputTypes() {
    this.itemService.loadItem('json-item-v1-input-types.json');
    this.contentTypeService.loadContentType('json-content-type-v1-input-types.json');
    // this.items$ = this.store.select(state => state.items);
    console.log('load content types');
  }

  identify(index, item) {
    console.log('identify', item);
    return item.entity.id;
  }
}

