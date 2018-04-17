import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Store } from '@ngrx/store';

import 'rxjs/add/operator/map';
import 'reflect-metadata';

import * as contentTypeActions from '../../shared/store/actions/content-type.actions';
import { AppState } from '../../shared/models';
import { Item, ContentType, Language } from '../../shared/models/eav';
import { of } from 'rxjs/observable/of';

import { ItemService } from '../../shared/services/item.service';
import { ContentTypeService } from '../../shared/services/content-type.service';

// import { EavState } from '../../shared/store';
import { ItemState } from '../../shared/store/reducers/item.reducer';
import * as fromStore from '../../shared/store';
import * as itemActions from '../../shared/store/actions/item.actions';
import { LanguageService } from '../../shared/services/language.service';

@Component({
  selector: 'app-multi-item-edit-form',
  templateUrl: './multi-item-edit-form.component.html',
  styleUrls: ['./multi-item-edit-form.component.css']
})
export class MultiItemEditFormComponent implements OnInit {
  // Test
  items$: Observable<Item[]>;
  // contentTypes$: Observable<ContentType[]>;
  languages$: Observable<Language[]>;
  currentLanguage$: Observable<string>;

  constructor(private itemService: ItemService,
    private contentTypeService: ContentTypeService,
    private languageService: LanguageService) {
    this.currentLanguage$ = languageService.getCurrentLanguage();
  }

  ngOnInit() {
    // console.log('MultiItemEditFormComponent ngOnInit');

    this.items$ = this.itemService.selectAllItems();

    this.languageService.loadLanguages();

    this.languages$ = this.languageService.selectAllLanguages();
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
    this.itemService.loadItem('json-item-v1-input-types.json');
    this.contentTypeService.loadContentType('json-content-type-v1-input-types.json');
    // this.items$ = this.store.select(state => state.items);
  }

  // Test
  loadBooks() {
    this.itemService.loadItem('json-item-v1-books.json');
    this.contentTypeService.loadContentType('json-content-type-v1-books.json');
  }

  // Test
  loadBooks1() {
    this.itemService.loadItem('json-item-v1-books1.json');
    this.contentTypeService.loadContentType('json-content-type-v1-books.json');
  }
  // Test
  loadBooks2() {
    this.itemService.loadItem('json-item-v1-books2.json');
    this.contentTypeService.loadContentType('json-content-type-v1-books.json');
  }
  // Test
  loadAuthors() {
    this.itemService.loadItem('json-item-v1-authors.json');
    this.contentTypeService.loadContentType('json-content-type-v1-authors.json');
  }

  // Link
  loadHyperLink() {
    this.itemService.loadItem('json-item-v1-link.json');
    this.contentTypeService.loadContentType('json-content-type-v1-link.json');
  }

  // Localization
  loadLocalization() {
    this.itemService.loadItem('json-item-v1-localization.json');
    this.contentTypeService.loadContentType('json-content-type-v1-localization.json');
  }

  // Custom
  loadCustom() {
    this.itemService.loadItem('json-item-v1-custom.json');
    this.contentTypeService.loadContentType('json-content-type-v1-custom.json');
  }

  trackByFn(index, item) {
    // console.log('identify', item);
    // if (item.entity.attributes.StringGroup1.values[0].value === 'this is working') {
    // console.log('identify change;', item.entity.attributes.StringGroup1.values[0].value)
    // }
    // console.log('trackByFn multi', item.entity.id);
    return item.entity.id;
  }
}

