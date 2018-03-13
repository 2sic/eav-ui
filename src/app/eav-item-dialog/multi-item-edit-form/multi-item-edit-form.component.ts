import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Store } from '@ngrx/store';

import 'rxjs/add/operator/map';
import 'reflect-metadata';

import * as contentTypeActions from '../../shared/store/actions/content-type.actions';
import { AppState } from '../../shared/models';
import { Item, ContentType } from '../../shared/models/eav';
import { of } from 'rxjs/observable/of';
import { ItemService } from '../../shared/services/item.service';
import { ContentTypeService } from '../../shared/services/content-type.service';

// import { EavState } from '../../shared/store';
import { ItemState } from '../../shared/store/reducers/item.reducer';
import * as fromStore from '../../shared/store';
import * as itemActions from '../../shared/store/actions/item.actions';

// export const geItemStateTest = (state: fromStore.EavState) => state.itemState;
// export const getItemsTest = (state: ItemState) => state.items;

// const getEav = state => state.eav;
// const getItemState = state => state.ItemState;



@Component({
  selector: 'app-multi-item-edit-form',
  templateUrl: './multi-item-edit-form.component.html',
  styleUrls: ['./multi-item-edit-form.component.css']
})
export class MultiItemEditFormComponent implements OnInit {
  // Test
  items$: Observable<Item[]>;
  // contentTypes$: Observable<ContentType[]>;

  constructor(private itemService: ItemService, private contentTypeService: ContentTypeService, private store: Store<fromStore.EavState>) {
    this.items$ = itemService.items$;
    // this.items$ = this.store.select(fromStore.getStateItems);

    // this.items$ = store.select(state => {
    //   console.log('eavState', state);
    //   const itemState = geItemStateTest(state);
    //   console.log('itemState', itemState);
    //   const items = getItemsTest(itemState);
    //   return items;
    // });
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
  }

  // Test
  loadPerson() {
    this.itemService.loadItem('json-item-v1-person.json');
    this.contentTypeService.loadContentType('json-content-type-v1-person.json');
    // this.items$ = this.store.select(state => state.items);
  }

  // Test
  loadStringInputTypes() {
    this.itemService.loadItem('json-item-v1-string-input-types.json');
    this.contentTypeService.loadContentType('json-content-type-v1-string-input-types.json');
    // this.items$ = this.store.select(state => state.items);
  }

  // Test
  loadInputTypes() {
    this.store.dispatch(new itemActions.LoadItemAction('json-item-v1-input-types.json'));
    // this.itemService.loadItem('json-item-v1-input-types.json');
    this.contentTypeService.loadContentType('json-content-type-v1-input-types.json');
    // this.items$ = this.store.select(state => state.items);
  }

  identify(index, item) {
    // console.log('identify', item);
    // if (item.entity.attributes.StringGroup1.values[0].value === 'this is working') {
    // console.log('identify change;', item.entity.attributes.StringGroup1.values[0].value)
    // }
    return item.entity.id;
  }
}

