import { Component, OnInit, ElementRef, ViewChild, QueryList, ViewChildren } from '@angular/core';
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
import { Router, ActivatedRoute } from '@angular/router';
import { ItemEditFormComponent } from '../item-edit-form/item-edit-form.component';

@Component({
  selector: 'app-multi-item-edit-form',
  templateUrl: './multi-item-edit-form.component.html',
  styleUrls: ['./multi-item-edit-form.component.css']
})
export class MultiItemEditFormComponent implements OnInit {
  // @ViewChild(ItemEditFormComponent) asdasd: ItemEditFormComponent;
  @ViewChildren(ItemEditFormComponent) itemEditFormComponentQueryList: QueryList<ItemEditFormComponent>;
  // Test
  items$: Observable<Item[]>;
  // contentTypes$: Observable<ContentType[]>;
  languages$: Observable<Language[]>;
  currentLanguage$: Observable<string>;

  queryParams = {};
  constructor(
    private itemService: ItemService,
    private contentTypeService: ContentTypeService,
    private languageService: LanguageService,
    private router: Router,
    private route: ActivatedRoute) {
    this.currentLanguage$ = languageService.getCurrentLanguage();
  }


  ngOnInit() {
    // console.log('MultiItemEditFormComponent ngOnInit');

    // set observing for items
    this.items$ = this.itemService.selectAllItems();
    // set observing for languages
    this.languages$ = this.languageService.selectAllLanguages();

    // TODO: read queryString in helper metod
    const href = this.router.url;
    console.log('this.router.url', this.router.url);
    console.log('this.route', this.route);
    console.log('this.route.params fragment', this.route.snapshot.fragment);
    console.log('this.route.params fragment split: ', this.route.snapshot.fragment.split('&'));

    this.route.snapshot.fragment.split('&').forEach(f => {
      this.queryParams[f.split('=')[0]] = f.split('=')[1];
    });
    console.log('this.route.snapshot.fragment split: ', this.queryParams);

    // console.log('this.route.snapshot.fragment appId:', this.queryParams['appId']);
    // console.log('this.route.snapshot.fragment cbid:', this.queryParams['cbid']);
    // console.log('this.route.snapshot.fragment mid:', this.queryParams['mid']);
    // console.log('this.route.snapshot.fragment tid:', this.queryParams['tid']);
    // console.log('this.route.snapshot.fragment zoneId:', this.queryParams['zoneId']);

    const appid = this.queryParams['appId'];
    const mid = this.queryParams['mid'];
    const cbid = this.queryParams['cbid'];
    const tid = this.queryParams['tid'];
    const items = this.queryParams['items'];
    const lang = this.queryParams['lang'];
    const langs = this.queryParams['langs'];
    const langpri = this.queryParams['langpri'];

    this.languageService.loadLanguages(JSON.parse(langs), lang, langpri, 'en-us');
    // TODO: destroy subscribe
    this.itemService.getAllDataForForm(appid, tid, mid, cbid, items).subscribe();

    // this.itemService.getAllData();
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

  /**
   * Submit all forms
   */
  submitOutside() {
    this.itemEditFormComponentQueryList.forEach((itemEditFormComponent: ItemEditFormComponent) => {
      itemEditFormComponent.form.submitOutside();
    });
  }

  isFormValid() {
    let formIsValid = false;
    if (this.itemEditFormComponentQueryList && this.itemEditFormComponentQueryList.length > 0) {
      formIsValid = true;
      this.itemEditFormComponentQueryList.forEach((itemEditFormComponent: ItemEditFormComponent) => {
        if (itemEditFormComponent.form.valid === false) {
          formIsValid = false;
        }
      });
    }
    return formIsValid;
  }
}

