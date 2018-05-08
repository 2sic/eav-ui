import {
  Component, OnInit, ElementRef, QueryList, ViewChildren, OnChanges, AfterViewChecked, ChangeDetectorRef, AfterContentChecked, OnDestroy
} from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Store, Action } from '@ngrx/store';

import 'rxjs/add/operator/map';
import 'rxjs/add/operator/switchMap';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/do';
// import 'rxjs/add/observable/zip';w
import { zip } from 'rxjs/observable/zip';
import 'reflect-metadata';

import * as contentTypeActions from '../../shared/store/actions/content-type.actions';
import * as fromItems from '../../shared/store/actions/item.actions';
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
import { UrlHelper } from '../../shared/helpers/url-helper';
import { EavService } from '../../shared/services/eav.service';
import { Subscription } from 'rxjs/Subscription';
import { Actions } from '@ngrx/effects';
import { MatSnackBar } from '@angular/material';
import { ValidationMessagesService } from '../../eav-material-controls/validators/validation-messages-service';

@Component({
  selector: 'app-multi-item-edit-form',
  templateUrl: './multi-item-edit-form.component.html',
  styleUrls: ['./multi-item-edit-form.component.css']
})
export class MultiItemEditFormComponent implements OnInit, AfterContentChecked, OnDestroy {
  @ViewChildren(ItemEditFormComponent) itemEditFormComponentQueryList: QueryList<ItemEditFormComponent>;
  // Test
  items$: Observable<Item[]>;
  // contentTypes$: Observable<ContentType[]>;
  languages$: Observable<Language[]>;
  currentLanguage$: Observable<string>;
  defaultLanguage$: Observable<string>;

  formsAreValid = false;
  formSuccess: Subscription;
  formSuccess$: Observable<any>;
  formSaveAllObservables$: Observable<Action>[] = [];
  formError: Subscription;
  formErrors: { [key: string]: any }[] = [];
  private subscriptions: Subscription[] = [];

  constructor(
    private itemService: ItemService,
    private contentTypeService: ContentTypeService,
    private eavService: EavService,
    private languageService: LanguageService,
    private router: Router,
    private route: ActivatedRoute,
    private changeDetectorRef: ChangeDetectorRef,
    private actions$: Actions,
    private snackBar: MatSnackBar,
    private validationMessagesService: ValidationMessagesService) {
    this.currentLanguage$ = languageService.getCurrentLanguage();
    this.defaultLanguage$ = languageService.getDefaultLanguage();
  }

  ngOnInit() {
    this.loadData();
    // set observing for items
    this.items$ = this.itemService.selectAllItems();
    // set observing for languages
    this.languages$ = this.languageService.selectAllLanguages();
    // suscribe to form submit
    this.saveFormMessagesSubscribe();
  }

  ngAfterContentChecked() {
    this.saveFormSuscribe();

    this.setFormsAreValid();
    // need this to detectChange this.formsAreValid after ViewChecked
    this.changeDetectorRef.detectChanges();
  }

  ngOnDestroy() {
    this.subscriptions.forEach(subscriber => subscriber.unsubscribe());
  }

  /**
   * observe formValue changes from all child forms
   */
  formValueChange() {
    this.setFormsAreValid();
  }

  /**
 * save all forms
 */
  saveAll(close: boolean) {
    if (this.formsAreValid) {
      this.itemEditFormComponentQueryList.forEach((itemEditFormComponent: ItemEditFormComponent) => {
        itemEditFormComponent.form.submitOutside();
      });

      if (close) {
        this.close();
      }
    } else {
      // TODO: error messages
      this.asdsadas();
    }
  }

  asdsadas() {
    // const formErrors = [];
    if (this.itemEditFormComponentQueryList && this.itemEditFormComponentQueryList.length > 0) {
      this.itemEditFormComponentQueryList.forEach((itemEditFormComponent: ItemEditFormComponent) => {
        //  itemEditFormComponent.form.form.invalid
        if (itemEditFormComponent.form.form.invalid) {
          console.log('ERROR LIST before', itemEditFormComponent.form.form);
          this.formErrors.push(this.validationMessagesService.validateForm(itemEditFormComponent.form.form, false));
        }
      });
    }

    console.log('ERROR LIST: ', this.formErrors);
  }

  /**
   * close (remove) iframe window
   */
  close() {
    // find and remove iframe
    // TODO: this is not good - need to find better solution
    const iframes = window.parent.frames.document.getElementsByTagName('iframe');
    if (iframes[0] && iframes[0].parentElement) {
      iframes[0].parentElement.remove();
    }
  }

  trackByFn(index, item) {
    return item.entity.id;
  }

  /**
   * Load all data for forms
   */
  private loadData() {
    const queryStringParameters = UrlHelper.readQueryStringParameters(this.route.snapshot.fragment);
    const appid = queryStringParameters['appId'];
    const mid = queryStringParameters['mid'];
    const cbid = queryStringParameters['cbid'];
    const tid = queryStringParameters['tid'];
    const items = queryStringParameters['items'];
    const lang = queryStringParameters['lang'];
    const langs = queryStringParameters['langs'];
    const langpri = queryStringParameters['langpri'];

    this.languageService.loadLanguages(JSON.parse(langs), lang, langpri, 'en-us'); // UILanguage harcoded (for future usage)
    this.subscriptions.push(
      this.eavService.loadAllDataForForm(appid, tid, mid, cbid, items).subscribe(data => {
        this.itemService.loadItems(data.Items);
        this.contentTypeService.loadContentTypes(data.ContentTypes);
      })
    );
  }

  /**
   * With zip function look all forms submit observables and when all finish save all data (call savemany service)
   */
  private saveFormSuscribe() {
    // important - only subscribe once
    if (this.formSaveAllObservables$.length === 0) {
      if (this.itemEditFormComponentQueryList && this.itemEditFormComponentQueryList.length > 0) {
        this.itemEditFormComponentQueryList.forEach((itemEditFormComponent: ItemEditFormComponent) => {
          this.formSaveAllObservables$.push(itemEditFormComponent.formSaveObservable());
        });
      }

      if (this.formSaveAllObservables$ && this.formSaveAllObservables$.length > 0) {
        this.subscriptions.push(
          zip(...this.formSaveAllObservables$)
            .switchMap((actions: fromItems.SaveItemAttributesValuesAction[]) => {
              // actions[0].updateValues - every action have data from
              // TODO - build body from actions
              const body = '';
              return this.eavService.savemany(actions[0].appId, body)
                .map(data => this.eavService.saveItemSuccess(data));
              // .do(data => console.log('working'));
            })
            .catch(err => of(this.eavService.saveItemError(err)))
            .subscribe()
        );
      }
    }
  }

  /**
   * display form messages on form success or form error
   */
  private saveFormMessagesSubscribe() {
    this.subscriptions.push(this.actions$
      .ofType(fromItems.SAVE_ITEM_ATTRIBUTES_VALUES_SUCCESS)
      .subscribe((action: fromItems.SaveItemAttributesValuesSuccessAction) => {
        console.log('success END: ', action.data);
        // TODO show success message
        // this.snackBar.open('saved',);
        this.snackBar.open('saved', '', {
          duration: 2000
        });
      }));
    this.subscriptions.push(this.actions$
      .ofType(fromItems.SAVE_ITEM_ATTRIBUTES_VALUES_ERROR)
      .subscribe((action: fromItems.SaveItemAttributesValuesErrorAction) => {
        console.log('error END', action.error);
        // TODO show error message
        this.snackBar.open('error', '', {
          duration: 2000
        });
      }));
  }

  /**
   * Determines whether all forms are valid and sets a this.formsAreValid depending on it
   */
  private setFormsAreValid() {
    this.formsAreValid = false;
    if (this.itemEditFormComponentQueryList && this.itemEditFormComponentQueryList.length > 0) {
      this.formsAreValid = true;
      this.itemEditFormComponentQueryList.forEach((itemEditFormComponent: ItemEditFormComponent) => {
        if (itemEditFormComponent.form.valid === false) {
          this.formsAreValid = false;
        }
      });
    }
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

  // // Test
  // loadAccordion() {
  //   this.itemService.loadItem('json-item-v1-accordion.json');
  //   this.contentTypeService.loadContentType('json-content-type-v1-accordion.json');
  //   // this.items$ = this.store.select(state => state.items);
  // }

  // // Test
  // loadPerson() {
  //   this.itemService.loadItem('json-item-v1-person.json');
  //   this.contentTypeService.loadContentType('json-content-type-v1-person.json');
  //   // this.items$ = this.store.select(state => state.items);
  // }

  // // Test
  // loadStringInputTypes() {
  //   this.itemService.loadItem('json-item-v1-string-input-types.json');
  //   this.contentTypeService.loadContentType('json-content-type-v1-string-input-types.json');
  //   // this.items$ = this.store.select(state => state.items);
  // }

  // // Test
  // loadInputTypes() {
  //   this.itemService.loadItem('json-item-v1-input-types.json');
  //   this.contentTypeService.loadContentType('json-content-type-v1-input-types.json');
  //   // this.items$ = this.store.select(state => state.items);
  // }

  // // Test
  // loadBooks() {
  //   this.itemService.loadItem('json-item-v1-books.json');
  //   this.contentTypeService.loadContentType('json-content-type-v1-books.json');
  // }

  // // Test
  // loadBooks1() {
  //   this.itemService.loadItem('json-item-v1-books1.json');
  //   this.contentTypeService.loadContentType('json-content-type-v1-books.json');
  // }
  // // Test
  // loadBooks2() {
  //   this.itemService.loadItem('json-item-v1-books2.json');
  //   this.contentTypeService.loadContentType('json-content-type-v1-books.json');
  // }
  // // Test
  // loadAuthors() {
  //   this.itemService.loadItem('json-item-v1-authors.json');
  //   this.contentTypeService.loadContentType('json-content-type-v1-authors.json');
  // }

  // // Link
  // loadHyperLink() {
  //   this.itemService.loadItem('json-item-v1-link.json');
  //   this.contentTypeService.loadContentType('json-content-type-v1-link.json');
  // }

  // // Localization
  // loadLocalization() {
  //   this.itemService.loadItem('json-item-v1-localization.json');
  //   this.contentTypeService.loadContentType('json-content-type-v1-localization.json');
  // }

  // // Custom
  // loadCustom() {
  //   this.itemService.loadItem('json-item-v1-custom.json');
  //   this.contentTypeService.loadContentType('json-content-type-v1-custom.json');
  // }
}

