import {
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  Component,
  ViewChild
} from '@angular/core';
import { Action } from '@ngrx/store';
import { Observable, of, BehaviorSubject } from 'rxjs';
import { switchMap, filter } from 'rxjs/operators';
import { ValidatorFn } from '@angular/forms';

import {
  ContentType,
  Item,
  EavAttributes,
  EavAttributesTranslated,
} from '../../shared/models/eav';
import { Actions, ofType } from '@ngrx/effects';
import { AttributeDef } from '../../shared/models/eav/attribute-def';
import { ContentTypeService } from '../../shared/services/content-type.service';
import { EavFormComponent } from '../../eav-dynamic-form/components/eav-form/eav-form.component';
import { EavService } from '../../shared/services/eav.service';
import { Feature } from '../../shared/models/feature/feature';
import { FieldConfigSet, ItemConfig, FormConfig, FieldConfigAngular, FieldConfigGroup } from '../../eav-dynamic-form/model/field-config';
import { InputTypesConstants } from '../../shared/constants/input-types-constants';
import { ItemService } from '../../shared/services/item.service';
import { LocalizationHelper } from '../../shared/helpers/localization-helper';
import { ValidationHelper } from '../../eav-material-controls/validators/validation-helper';
import * as fromItems from '../../shared/store/actions/item.actions';
import isEmpty from 'lodash/isEmpty';
import { InputFieldHelper } from '../../shared/helpers/input-field-helper';
import { EavConfiguration } from '../../shared/models/eav-configuration';

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
    private actions$: Actions
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

      if (this.form.valueIsChanged(formValues)) {
        // set new values to form
        this.form.patchValue(formValues, emit);
      }
      // important to be after patchValue
      this.eavService.triggerFormSetValueChange(formValues);
    }
  }

  private loadContentTypeFromStore() {
    const id = this.item.entity.type === null
      ? this.item.header.contentTypeName
      : this.item.entity.type.id;
    // Load content type for item from store
    this.contentType$ = this.contentTypeService.getContentTypeById(id);
    // create form fields from content type
    this.itemFields$ = this.loadContentTypeFormFields();
  }

  private loadContentTypeFormFields(): Observable<FieldConfigSet[]> {
    return this.contentType$
      .pipe(
        switchMap((data: ContentType) => {
          const allInputTypeNames: string[] = InputFieldHelper.getInputTypeNamesFromAttributes(data.contentType.attributes);
          // build first empty
          const parentFieldGroup: FieldConfigSet = this.buildFieldConfigSet(null, null, allInputTypeNames,
            InputTypesConstants.emptyDefault, data.contentType.settings, true);
          let currentFieldGroup: FieldConfigSet = parentFieldGroup;

          // loop through contentType attributes
          data.contentType.attributes.forEach((attribute, index) => {
            try {
              // if input type is empty-default create new field group and than continue to add fields to that group
              const inputTypeName: string = InputFieldHelper.getInputTypeNameFromAttribute(attribute);
              const isEmptyInputType = (inputTypeName === InputTypesConstants.emptyDefault) ||
                (inputTypeName === InputTypesConstants.empty);
              if (isEmptyInputType) {
                // group-fields (empty)
                currentFieldGroup = this.buildFieldConfigSet(attribute, index, allInputTypeNames, inputTypeName,
                  data.contentType.settings, false);
                const field = parentFieldGroup.field as FieldConfigGroup;
                field.fieldGroup.push(currentFieldGroup);
              } else {
                // all other fields (not group empty)
                const fieldConfigSet = this.buildFieldConfigSet(attribute, index, allInputTypeNames, inputTypeName,
                  data.contentType.settings, null);
                const field = currentFieldGroup.field as FieldConfigGroup;
                field.fieldGroup.push(fieldConfigSet);
              }
            } catch (error) {
              console.error(`loadContentTypeFormFields(...) - error loading attribut ${index}`, attribute);
              throw error;
            }
          });

          return of([parentFieldGroup]);
        })
      );
  }

  private buildFieldConfigSet(attribute: AttributeDef, index: number, allInputTypeNames: string[], inputType: string,
    contentTypeSettings: EavAttributes, isParentGroup: boolean): FieldConfigSet {
    const entity: ItemConfig = {
      entityId: this.item.entity.id,
      entityGuid: this.item.entity.guid,
      header: this.item.header,
    };
    const form: FormConfig = {
      allInputTypeNames: allInputTypeNames,
      features: this.features,
    };
    const field = this.buildFieldConfig(attribute, index, inputType, contentTypeSettings, isParentGroup);

    const fieldConfigSet: FieldConfigSet = { field, entity, form };
    return fieldConfigSet;
  }

  private buildFieldConfig(attribute: AttributeDef, index: number, inputType: string, contentTypeSettings: EavAttributes,
    isParentGroup: boolean): FieldConfigAngular {
    let fieldConfig: FieldConfigAngular;
    let settingsTranslated: EavAttributesTranslated;
    let fullSettings: EavAttributes;
    const isEmptyInputType = (inputType === InputTypesConstants.emptyDefault)
      || (inputType === InputTypesConstants.empty);

    if (attribute) {
      settingsTranslated = LocalizationHelper.translateSettings(attribute.settings, this.currentLanguage, this.defaultLanguage);
      fullSettings = attribute.settings;
    } else if (isEmptyInputType && contentTypeSettings) {
      settingsTranslated = LocalizationHelper.translateSettings(contentTypeSettings, this.currentLanguage, this.defaultLanguage);
      fullSettings = contentTypeSettings;
    }

    const name: string = attribute ? attribute.name : 'Edit Item';
    const label: string = InputFieldHelper.getFieldLabel(attribute, settingsTranslated) || 'Edit Item';
    const wrappers: string[] = InputFieldHelper.setWrappers(inputType, settingsTranslated);

    if (isEmptyInputType) {
      fieldConfig = {
        fullSettings: fullSettings,
        fieldGroup: [], // empty specific
        label: label,
        name: name,
        settings: settingsTranslated,
        inputType: inputType,
        isParentGroup: isParentGroup, // empty specific
        wrappers: wrappers,
      } as FieldConfigGroup;
    } else {
      const validationList: ValidatorFn[] = ValidationHelper.getValidations(settingsTranslated);
      const required: boolean = ValidationHelper.isRequired(settingsTranslated);
      let initialValue = LocalizationHelper.translate(
        this.currentLanguage,
        this.defaultLanguage,
        this.item.entity.attributes[name],
        null
      );
      // set default value if needed
      if (isEmpty(initialValue) && typeof initialValue !== typeof true && typeof initialValue !== typeof 1) {
        initialValue = this.itemService.setDefaultValue(this.item, attribute, inputType, settingsTranslated,
          this.currentLanguage, this.defaultLanguage);
      }
      const disabled: boolean = settingsTranslated.Disabled;

      fieldConfig = {
        disabled: disabled, // other fields specific
        fullSettings: fullSettings,
        index: index, // other fields specific
        label: label,
        name: name,
        placeholder: `Enter ${name}`,  // other fields specific
        required: required, // other fields specific
        settings: settingsTranslated,
        inputType: inputType,
        type: attribute.type, // other fields specific
        validation: validationList, // other fields specific
        initialValue: initialValue, // other fields specific
        wrappers: wrappers,
      };
    }
    return fieldConfig;
  }

}
