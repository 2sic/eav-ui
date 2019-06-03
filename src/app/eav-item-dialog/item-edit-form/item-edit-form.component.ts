import { EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, Component, ViewChild } from '@angular/core';
import { Action } from '@ngrx/store';
import { Observable, BehaviorSubject } from 'rxjs';
import { filter } from 'rxjs/operators';
import { Actions, ofType } from '@ngrx/effects';

import { ContentType, Item } from '../../shared/models/eav';
import { ContentTypeService } from '../../shared/services/content-type.service';
import { EavFormComponent } from '../../eav-dynamic-form/components/eav-form/eav-form.component';
import { EavService } from '../../shared/services/eav.service';
import { Feature } from '../../shared/models/feature/feature';
import { FieldConfigSet } from '../../eav-dynamic-form/model/field-config';
import { ItemService } from '../../shared/services/item.service';
import { LocalizationHelper } from '../../shared/helpers/localization-helper';
import * as fromItems from '../../shared/store/actions/item.actions';
import { EavConfiguration } from '../../shared/models/eav-configuration';
import { BuildFieldsService } from './item-edit-form-services/build-fields.service';
import { InputFieldHelper } from '../../shared/helpers/input-field-helper';
import { FormSet } from '../../shared/models/eav/form-set';

@Component({
  selector: 'app-item-edit-form',
  templateUrl: './item-edit-form.component.html',
  styleUrls: ['./item-edit-form.component.scss']
})
export class ItemEditFormComponent implements OnInit, OnChanges, OnDestroy {
  @ViewChild(EavFormComponent) form: EavFormComponent;

  @Output()
  itemFormValueChange: EventEmitter<any> = new EventEmitter<any>();

  @Input() defaultLanguage: string;
  @Input() features: Feature[];

  @Input()
  set currentLanguage(value: string) {
    this.currentLanguageValue = value;
    this.setFormValues(this.item, false); // need set emit to true because of  external commponents
  }
  get currentLanguage(): string {
    return this.currentLanguageValue;
  }

  @Input()
  set item(value: Item) {
    this.itemBehaviorSubject$.next(value);
  }
  get item(): Item {
    return this.itemBehaviorSubject$.getValue();
  }

  get allControlsAreDisabled() {
    return this.checkAreAllControlsDisabled();
  }

  private eavConfig: EavConfiguration;
  private currentLanguageValue: string;
  private itemBehaviorSubject$: BehaviorSubject<Item> = new BehaviorSubject<Item>(null);

  contentType$: Observable<ContentType>;
  itemFields$: Observable<FieldConfigSet[]>;
  formIsValid = false;

  constructor(
    private itemService: ItemService,
    private contentTypeService: ContentTypeService,
    private eavService: EavService,
    private actions$: Actions,
    private buildFieldsService: BuildFieldsService,
  ) {
    this.eavConfig = eavService.getEavConfiguration();
  }

  ngOnInit() {
    this.itemBehaviorSubject$.subscribe((item: Item) => {
      this.setFormValues(item, false);
    });

    this.loadContentTypeFromStore();
  }

  ngOnDestroy(): void {
    this.itemBehaviorSubject$.unsubscribe();
  }

  ngOnChanges(): void { }

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
    if (this.form.form.valid) {
      this.itemService.updateItemAttributesValues(
        this.item.entity.id, values, this.currentLanguage,
        this.defaultLanguage, this.item.entity.guid
      );
    }

    // emit event to parent
    this.itemFormValueChange.emit();
  }

  submit(values: { [key: string]: any }) {
    if (this.form.form.valid ||
      this.allControlsAreDisabled ||
      (this.item.header.group && this.item.header.group.slotCanBeEmpty)) {
      this.eavService.saveItem(Number(this.eavConfig.appId), this.item, values, this.currentLanguage, this.defaultLanguage);
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
      const formSet: FormSet = {
        entityGuid: item.entity.guid,
        formValues: formValues
      };
      this.eavService.triggerFormSetValueChange(formSet);
    }
  }

  private loadContentTypeFromStore() {
    const contentTypeId = InputFieldHelper.getContentTypeId(this.item);
    // Load content type for item from store
    this.contentType$ = this.contentTypeService.getContentTypeById(contentTypeId);
    // create form fields from content type
    this.itemFields$ = this.buildFieldsService.buildFields(this.contentType$, this.item, this.features, this.currentLanguage,
      this.defaultLanguage);
  }

}
