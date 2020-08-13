import { EventEmitter, Input, OnDestroy, OnInit, Output, Component, ViewChild } from '@angular/core';
import { Action } from '@ngrx/store';
import { Observable, BehaviorSubject, Subscription } from 'rxjs';
import { filter, take, skip } from 'rxjs/operators';
import { Actions, ofType } from '@ngrx/effects';

import { ContentType, Item } from '../../shared/models/eav';
import { ContentTypeService } from '../../shared/store/ngrx-data/content-type.service';
import { EavFormComponent } from '../../eav-dynamic-form/components/eav-form/eav-form.component';
import { EavService } from '../../shared/services/eav.service';
import { FieldConfigSet } from '../../eav-dynamic-form/model/field-config';
import { ItemService } from '../../shared/store/ngrx-data/item.service';
import { LocalizationHelper } from '../../shared/helpers/localization-helper';
import * as fromItems from '../../shared/store/actions/item.actions';
import { EavConfiguration } from '../../shared/models/eav-configuration';
import { BuildFieldsService } from './item-edit-form-services/build-fields.service';
import { InputFieldHelper } from '../../shared/helpers/input-field-helper';
import { LanguageInstanceService } from '../../shared/store/ngrx-data/language-instance.service';

@Component({
  selector: 'app-item-edit-form',
  templateUrl: './item-edit-form.component.html',
  styleUrls: ['./item-edit-form.component.scss']
})
export class ItemEditFormComponent implements OnInit, OnDestroy {
  @ViewChild(EavFormComponent) form: EavFormComponent;
  @Input() formId: number;
  @Input()
  set item(value: Item) {
    this.itemBehaviorSubject$.next(value);
  }
  get item(): Item {
    return this.itemBehaviorSubject$.getValue();
  }
  @Output() itemFormValueChange = new EventEmitter<null>();

  get allControlsAreDisabled() {
    return this.checkAreAllControlsDisabled();
  }

  private eavConfig: EavConfiguration;
  private defaultLanguage$: Observable<string>;
  private defaultLanguage: string;
  private currentLanguage$: Observable<string>;
  currentLanguage: string;
  private subscriptions: Subscription[] = [];
  private itemBehaviorSubject$: BehaviorSubject<Item> = new BehaviorSubject<Item>(null);

  contentType$: Observable<ContentType>;
  itemFields$: Observable<FieldConfigSet[]>;
  formIsValid = false;

  constructor(
    private languageInstanceService: LanguageInstanceService,
    private itemService: ItemService,
    private contentTypeService: ContentTypeService,
    private eavService: EavService,
    private actions$: Actions,
    private buildFieldsService: BuildFieldsService,
  ) {
    this.eavConfig = this.eavService.getEavConfiguration();
  }

  ngOnInit() {
    this.defaultLanguage$ = this.languageInstanceService.getDefaultLanguage(this.formId);
    this.currentLanguage$ = this.languageInstanceService.getCurrentLanguage(this.formId);
    this.setInitialValues();
    this.subscribeToChanges();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(subscription => { subscription.unsubscribe(); });
  }

  /** Observe is item form is saved */
  formSaveObservable(): Observable<Action> {
    return this.actions$
      .pipe(ofType(fromItems.SAVE_ITEM_ATTRIBUTES_VALUES),
        filter((action: fromItems.SaveItemAttributesValuesAction) =>
          this.item.entity.id === 0
            ? this.item.entity.guid === action.item.entity.guid
            : this.item.entity.id === action.item.entity.id));
  }

  /**
   * Update NGRX/store on form value change
   * @param values key:value list of fields from form
   */
  formValueChange(values: { [key: string]: any }) {
    this.itemService.updateItemAttributesValues(
      this.item.entity.id, values, this.currentLanguage,
      this.defaultLanguage, this.item.entity.guid
    );

    // emit event to parent
    this.itemFormValueChange.emit();
  }

  submit(values: { [key: string]: any }) {
    if (this.form.form.valid || this.allControlsAreDisabled || (this.item.header.Group && this.item.header.Group.SlotCanBeEmpty)) {
      // spm Double check if we should update values one last time before submitting
      this.eavService.saveItem(this.item);
    }
  }

  private checkAreAllControlsDisabled(): boolean {
    let allDisabled = true;
    Object.keys(this.form.form.controls).forEach(key => {
      if (!this.form.form.controls[key].disabled) {
        allDisabled = false;
      }
    });
    return allDisabled;
  }

  private setFormValues = (item: Item, emit: boolean) => {
    if (this.form) {
      const formValues: { [name: string]: any } = {};
      Object.keys(item.entity.attributes).forEach(attributeKey => {
        formValues[attributeKey] = LocalizationHelper.translate(this.currentLanguage,
          this.defaultLanguage, item.entity.attributes[attributeKey], null);
      });

      // spm true only on language change?
      if (this.form.valueIsChanged(formValues)) {
        // set new values to form
        this.form.patchValue(formValues, emit);
      }
      // important to be after patchValue
      this.eavService.formValueChange$.next({
        formId: this.formId,
        entityGuid: this.item.entity.guid,
        entityValues: formValues,
      });
    }
  }

  private setInitialValues() {
    this.defaultLanguage$.pipe(take(1)).subscribe(defaultLang => { this.defaultLanguage = defaultLang; });
    this.currentLanguage$.pipe(take(1)).subscribe(currentLang => { this.currentLanguage = currentLang; });
    const contentTypeId = InputFieldHelper.getContentTypeId(this.item);
    this.contentType$ = this.contentTypeService.getContentTypeById(contentTypeId);
    // create input fields from content type
    this.itemFields$ = this.buildFieldsService.buildFields(this.contentType$, this.item, this.formId, this.currentLanguage,
      this.defaultLanguage);
  }

  private subscribeToChanges() {
    this.subscriptions.push(
      this.itemBehaviorSubject$.subscribe((item: Item) => { this.setFormValues(item, false); }),
      this.defaultLanguage$.pipe(skip(1)).subscribe(defaultLang => { this.defaultLanguage = defaultLang; }),
      this.currentLanguage$.pipe(skip(1)).subscribe(currentLang => {
        this.currentLanguage = currentLang;
        this.setFormValues(this.item, false);
      }),
    );
  }
}
