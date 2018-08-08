import {
  Component, OnInit, QueryList, ViewChildren, ChangeDetectorRef, AfterContentChecked, OnDestroy, Inject, AfterContentInit, AfterViewInit
} from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Observable, zip, of, Subscription } from 'rxjs';
import { switchMap, map, tap, catchError } from 'rxjs/operators';
import { Action } from '@ngrx/store';
import { Actions } from '@ngrx/effects';
import { MatSnackBar, MAT_DIALOG_DATA } from '@angular/material';

import 'reflect-metadata';
import * as fromItems from '../../shared/store/actions/item.actions';
import { Item, Language } from '../../shared/models/eav';
import { ContentTypeService } from '../../shared/services/content-type.service';
import { ItemEditFormComponent } from '../item-edit-form/item-edit-form.component';
import { ItemService } from '../../shared/services/item.service';
import { EavService } from '../../shared/services/eav.service';
import { LanguageService } from '../../shared/services/language.service';
import { ValidationMessagesService } from '../../eav-material-controls/validators/validation-messages-service';
import { TranslateService } from '@ngx-translate/core';
import { JsonItem1 } from '../../shared/models/json-format-v1';
import { EavConfiguration } from '../../shared/models/eav-configuration';
import { InputTypeService } from '../../shared/services/input-type.service';
import { DialogTypeConstants } from '../../shared/constants/type-constants';

export interface FormDialogData {
  id: string;
  type: string;
}

@Component({
  selector: 'app-multi-item-edit-form',
  templateUrl: './multi-item-edit-form.component.html',
  styleUrls: ['./multi-item-edit-form.component.css']
})
export class MultiItemEditFormComponent implements OnInit, AfterContentChecked, OnDestroy {
  @ViewChildren(ItemEditFormComponent) itemEditFormComponentQueryList: QueryList<ItemEditFormComponent>;

  items$: Observable<Item[]>;
  languages$: Observable<Language[]>;
  currentLanguage$: Observable<string>;
  defaultLanguage$: Observable<string>;
  formSaveAllObservables$: Observable<Action>[] = [];
  formErrors: { [key: string]: any }[] = [];
  Object = Object;
  formsAreValid = false;
  closeWindow = false;
  willPublish = false;     // default is won't publish, but will usually be overridden
  publishMode = 'hide';    // has 3 modes: show, hide, branch (where branch is a hidden, linked clone)
  enableDraft = false;

  private subscriptions: Subscription[] = [];

  private eavConfig: EavConfiguration;

  constructor(@Inject(MAT_DIALOG_DATA) private formDialogData: FormDialogData,
    private itemService: ItemService,
    private inputTypeService: InputTypeService,
    private contentTypeService: ContentTypeService,
    private eavService: EavService,
    private languageService: LanguageService,
    private changeDetectorRef: ChangeDetectorRef,
    private actions$: Actions,
    private snackBar: MatSnackBar,
    private validationMessagesService: ValidationMessagesService,
    private translate: TranslateService) {
    this.currentLanguage$ = languageService.getCurrentLanguage();
    this.defaultLanguage$ = languageService.getDefaultLanguage();

    this.translate.setDefaultLang('en');
    this.translate.use('en');
    // Read configuration from queryString
    this.eavConfig = this.eavService.getEavConfiguration();
    this.languageService.loadLanguages(JSON.parse(this.eavConfig.langs), this.eavConfig.lang, this.eavConfig.langpri, 'en-us');
  }

  ngOnInit() {
    this.loadItemsData();
    this.setLanguageConfig();
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
    // reset form errors
    this.formErrors = [];
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
        this.closeWindow = true;
        // this.close();
      }
    } else {
      this.displayAllValidationMessages();
    }
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
  private loadItemsData() {
    const entityId: number = Number(this.formDialogData.id);

    // if dialog type load with entity ids (edit - entity)
    if (this.formDialogData.type === DialogTypeConstants.byEntity && entityId) {
      this.eavService.loadAllDataForFormByEntity(this.eavConfig.appId, [{ 'EntityId': entityId }]).subscribe(data => {
        this.afterLoadItemsData(data);
      });
      // this.items$ = this.itemService.selectItemsByIdList([entityId]);
    } else {  // else dialog type load without entity ids. (edit - toolbar)
      this.eavService.loadAllDataForForm(this.eavConfig.appId).subscribe(data => {
        this.afterLoadItemsData(data);
        this.items$ = this.itemService.selectItemsByIdList(data.Items.map(item => item.Entity.Id));
      });
    }
  }

  private afterLoadItemsData(data: any) {
    this.itemService.loadItems(data.Items);
    this.inputTypeService.loadInputTypes(data.InputTypes);
    this.contentTypeService.loadContentTypes(data.ContentTypes);
    this.setPublishMode(data.Items);
    this.items$ = this.itemService.selectItemsByIdList(data.Items.map(item => item.Entity.Id));
  }

  /**
   * Read Eav Configuration
   */
  // private setEavConfiguration() {
  //   const queryStringParameters = UrlHelper.readQueryStringParameters(this.route.snapshot.fragment);
  //   console.log('queryStringParameters', queryStringParameters);
  //   // const eavConfiguration: EavConfiguration = UrlHelper.getEavConfiguration(queryStringParameters);
  //   this.eavConfig = UrlHelper.getEavConfiguration(queryStringParameters);
  // }

  private setLanguageConfig() {
    this.setTranslateLanguage(this.eavConfig.lang);
    // UILanguage harcoded (for future usage)
    // this.languageService.loadLanguages(JSON.parse(this.eavConfig.langs), this.eavConfig.lang, this.eavConfig.langpri, 'en-us');

    this.languages$ = this.languageService.selectAllLanguages();
    // on current language change reset form errors
    this.subscriptions.push(this.currentLanguage$.subscribe(len => {
      this.formErrors = [];
    }));
  }

  /**
   * Set translate language of all forms
   * @param language
   *
   */
  private setTranslateLanguage(language: string) {
    if (language) {
      // TODO: find better solution
      const isoLangCode = language.substring(0, language.indexOf('-') > 0 ? language.indexOf('-') : 2);
      this.translate.use(isoLangCode);
    }
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
            .pipe(
              switchMap((actions: fromItems.SaveItemAttributesValuesAction[]) => {
                console.log('ZIP ACTIONS ITEM: ', JsonItem1.create(actions[0].item));
                const allItems = [];
                actions.forEach(action => {
                  allItems.push(JsonItem1.create(action.item));
                });

                const body = `{"Items": ${JSON.stringify(allItems)}}`;
                return this.eavService.savemany(this.eavConfig.appId, this.eavConfig.partOfPage, body)
                  .pipe(
                    map(data => this.eavService.saveItemSuccess(data)),
                    tap(data => console.log('working'))
                  );
              }),
              catchError(err => of(this.eavService.saveItemError(err)))
            )
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
        this.snackBarOpen('saved', this.closeWindow);
      }));
    this.subscriptions.push(this.actions$
      .ofType(fromItems.SAVE_ITEM_ATTRIBUTES_VALUES_ERROR)
      .subscribe((action: fromItems.SaveItemAttributesValuesErrorAction) => {
        console.log('error END', action.error);
        // TODO show error message
        this.snackBarOpen('error', false);
      }));
  }

  /**
   * Open snackbar with message and after closed call function close
   * @param message
   * @param callClose
   */
  private snackBarOpen(message: string, callClose: boolean) {
    const snackBarRef = this.snackBar.open(message, '', {
      duration: 2000
    });

    if (callClose) {
      this.subscriptions.push(
        snackBarRef.afterDismissed().subscribe(null, null, () => {
          this.close();
        })
      );
    }
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
   * Fill in all error validation messages from all forms
   */
  private displayAllValidationMessages() {
    this.formErrors = [];
    if (this.itemEditFormComponentQueryList && this.itemEditFormComponentQueryList.length > 0) {
      this.itemEditFormComponentQueryList.forEach((itemEditFormComponent: ItemEditFormComponent) => {
        if (itemEditFormComponent.form.form.invalid) {
          this.formErrors.push(this.validationMessagesService.validateForm(itemEditFormComponent.form.form, false));
        }
      });
    }
  }

  // TODO: finish group and new entity ?????
  private setPublishMode(items: Item[]) {
    items.forEach(item => {

      // If the entity is null, it does not exist yet. Create a new one
      // TODO: do we need this ???
      // if (!item.entity && !!item.header.contentTypeName) {
      //   // TODO: do we need this ???
      //   item.entity = entitiesSvc.newEntity(item.header);
      // }
      // TODO: do we need this ???
      // item.entity = enhanceEntity(item.entity);

      ////// load more content-type metadata to show
      //// vm.items[i].ContentType = contentTypeSvc.getDetails(vm.items[i].Header.ContentTypeName);
      // set slot value - must be inverte for boolean-switch
      // const grp = item.header.group;
      // item.slotIsUsed = (grp === null || grp === undefined || grp.SlotIsEmpty !== true);
    });

    // this.willPublish = items[0].entity.IsPublished;
    // this.enableDraft = items[0].header.entityId !== 0; // it already exists, so enable draft
    // this.publishMode = items[0].entity.IsBranch
    //   ? 'branch' // it's a branch, so it must have been saved as a draft-branch
    //   : items[0].entity.IsPublished ? 'show' : 'hide';

    // if publish mode is prohibited, revert to default
    if (!this.eavConfig.versioningOptions[this.publishMode]) {
      this.publishMode = Object.keys(this.eavConfig.versioningOptions)[0];
    }
  }
}

