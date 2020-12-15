import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
import { Actions, ofType } from '@ngrx/effects';
import { Action } from '@ngrx/store';
import { Observable, Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';
import { EavFormComponent } from '../../eav-dynamic-form/components/eav-form/eav-form.component';
import { FormValueChange } from '../../eav-dynamic-form/components/eav-form/eav-form.models';
import { FieldConfigSet } from '../../eav-dynamic-form/model/field-config';
import { InputFieldHelper } from '../../shared/helpers/input-field-helper';
import { LocalizationHelper } from '../../shared/helpers/localization-helper';
import { ContentType, Item } from '../../shared/models/eav';
import { EavService } from '../../shared/services/eav.service';
import * as fromItems from '../../shared/store/actions/item.actions';
import { ContentTypeService } from '../../shared/store/ngrx-data/content-type.service';
import { ItemService } from '../../shared/store/ngrx-data/item.service';
import { LanguageInstanceService } from '../../shared/store/ngrx-data/language-instance.service';
import { BuildFieldsService } from './build-fields.service';

@Component({
  selector: 'app-item-edit-form',
  templateUrl: './item-edit-form.component.html',
  styleUrls: ['./item-edit-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ItemEditFormComponent implements OnInit, OnDestroy, OnChanges {
  @ViewChild(EavFormComponent) form: EavFormComponent;
  @Input() item: Item;
  @Input() formId: number;
  @Input() private enableHistory: boolean;
  @Output() private itemFormValueChange = new EventEmitter<void>();

  contentType$: Observable<ContentType>;
  /** spm WARNING: Do not subscribe to this twice or form will break. Items' attributes in store will get messed up */
  itemFields$: Observable<FieldConfigSet[]>;
  currentLanguage: string;

  private defaultLanguage: string;
  private subscription = new Subscription();

  constructor(
    private languageInstanceService: LanguageInstanceService,
    private itemService: ItemService,
    private contentTypeService: ContentTypeService,
    private eavService: EavService,
    private actions$: Actions,
    private buildFieldsService: BuildFieldsService,
  ) { }

  ngOnInit() {
    this.subscription.add(
      this.languageInstanceService.getDefaultLanguage(this.formId).subscribe(defaultLang => {
        this.defaultLanguage = defaultLang;
      })
    );

    this.subscription.add(
      this.languageInstanceService.getCurrentLanguage(this.formId).subscribe(currentLang => {
        this.currentLanguage = currentLang;
        this.setFormValues();
      })
    );

    // create input fields from content type
    const contentTypeId = InputFieldHelper.getContentTypeId(this.item);
    this.contentType$ = this.contentTypeService.getContentTypeById(contentTypeId);
    this.itemFields$ = this.buildFieldsService.buildFields(
      this.contentType$,
      this.item,
      this.formId,
      this.currentLanguage,
      this.defaultLanguage,
      this.enableHistory,
    );
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.item != null) {
      this.setFormValues();
    }
  }

  /** Observe is item form is saved */
  formSaveObservable() {
    return this.actions$.pipe(
      ofType(fromItems.SAVE_ITEM_ATTRIBUTES_VALUES),
      filter((action: fromItems.SaveItemAttributesValuesAction) =>
        this.item.entity.id === 0 ? this.item.entity.guid === action.item.entity.guid : this.item.entity.id === action.item.entity.id
      ),
    ) as Observable<Action>;
  }

  /** Update NGRX/store on form value change */
  formValueChange(change: FormValueChange) {
    this.itemService.updateItemAttributesValues(this.item.entity.guid, change.formValues, this.currentLanguage, this.defaultLanguage);

    // run formulas when form value is changed
    change.formulaInstance.runSettingsFormulas();
    change.formulaInstance.runValueFormulas();
    this.itemFormValueChange.emit();
  }

  submit() {
    if (this.form.form.valid || this.checkAreAllControlsDisabled() || (this.item.header.Group && this.item.header.Group.SlotCanBeEmpty)) {
      this.eavService.saveItem(this.item);
    }
  }

  checkAreAllControlsDisabled() {
    let allDisabled = true;
    const controlKeys = Object.keys(this.form.form.controls);
    for (const key of controlKeys) {
      if (!this.form.form.controls[key].disabled) {
        allDisabled = false;
        break;
      }
    }
    return allDisabled;
  }

  private setFormValues() {
    if (!this.form) { return; }

    const formValues: { [name: string]: any } = {};
    Object.keys(this.item.entity.attributes).forEach(attributeKey => {
      formValues[attributeKey] = LocalizationHelper.translate(
        this.currentLanguage,
        this.defaultLanguage,
        this.item.entity.attributes[attributeKey],
        null,
      );
    });

    // spm true only on language change?
    if (this.form.valueIsChanged(formValues)) {
      // set new values to form
      this.form.patchValue(formValues, false);
    }
    // important to be after patchValue
    this.eavService.formValueChange$.next({
      formId: this.formId,
      entityGuid: this.item.entity.guid,
      entityValues: formValues,
    });
  }

}
