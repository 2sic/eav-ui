import {
  Component, ViewChild, OnInit, Input, OnChanges, OnDestroy, EventEmitter, Output
} from '@angular/core';
import { ValidatorFn } from '@angular/forms';
import { Observable, of, BehaviorSubject } from 'rxjs';
import { switchMap, filter } from 'rxjs/operators';
import { Action } from '@ngrx/store';

// TODO: fix this dependency - from other module - move maybe to shared
import { FieldConfig } from '../../eav-dynamic-form/model/field-config';
// TODO: fix this dependency
import { EavFormComponent } from '../../eav-dynamic-form/components/eav-form/eav-form.component';
import {
  Item, ContentType, EavAttributes, EavValues
} from '../../shared/models/eav';
import { AttributeDef } from '../../shared/models/eav/attribute-def';
import { InputTypesConstants } from '../../shared/constants/input-types-constants';
import { ItemService } from '../../shared/services/item.service';
import { ContentTypeService } from '../../shared/services/content-type.service';
import { LocalizationHelper } from '../../shared/helpers/localization-helper';
import { ValidationHelper } from '../../eav-material-controls/validators/validation-helper';
import { EavService } from '../../shared/services/eav.service';
import { Actions } from '@ngrx/effects';
import * as fromItems from '../../shared/store/actions/item.actions';

@Component({
  selector: 'app-item-edit-form',
  templateUrl: './item-edit-form.component.html',
  styleUrls: ['./item-edit-form.component.css']
})
export class ItemEditFormComponent implements OnInit, OnChanges, OnDestroy {
  @ViewChild(EavFormComponent) form: EavFormComponent;

  @Output()
  itemFormValueChange: EventEmitter<any> = new EventEmitter<any>();

  @Input() defaultLanguage: string;

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

  private eavConfig;
  private currentLanguageValue: string;
  private itemBehaviorSubject$: BehaviorSubject<Item> = new BehaviorSubject<Item>(null);
  contentType$: Observable<ContentType>;
  itemFields$: Observable<FieldConfig[]>;

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

  public formSaveObservable(): Observable<Action> {
    return this.actions$
      .ofType(fromItems.SAVE_ITEM_ATTRIBUTES_VALUES)
      .pipe(filter((action: fromItems.SaveItemAttributesValuesAction) => action.item.entity.id === this.item.entity.id));
  }

  ngOnDestroy(): void {
    this.itemBehaviorSubject$.unsubscribe();
    // this.formSuccess.unsubscribe();
    // this.formError.unsubscribe();
  }

  ngOnChanges(): void {
    console.log('ItemEditFormComponent current change: ', this.currentLanguage);
    // this.formIsValid = this.form.form.valid;
  }

  /**
   * Update NGRX/store on form value change
   * @param values key:value list of fields from form
   */
  formValueChange(values: { [key: string]: any }) {
    if (this.form.form.valid) {
      this.itemService.updateItemAttributesValues(this.item.entity.id, values, this.currentLanguage, this.defaultLanguage);
    }

    // emit event to perent
    this.itemFormValueChange.emit();
  }

  submit(values: { [key: string]: any }) {
    console.log('submit item edit');
    console.log(values);

    if (this.form.form.valid) {
      // TODO create body for submit
      this.eavService.saveItem(this.eavConfig.appId, this.item, values, this.currentLanguage, this.defaultLanguage);
    }
  }

  // deleteItem() {
  //   this.itemService.deleteItem(this.item);
  // }

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
    // Load content type for item from store
    this.contentType$ = this.contentTypeService.getContentTypeById(this.item.entity.type.id);
    // create form fields from content type
    this.itemFields$ = this.loadContentTypeFormFields();
  }

  /**
   * load content type attributes to Formly FormFields (formlyFieldConfigArray)
   */
  private loadContentTypeFormFields = (): Observable<FieldConfig[]> => {
    return this.contentType$
      .pipe(
        switchMap((data) => {
          const parentFieldGroup = this.createEmptyFieldGroup(null, false);
          let currentFieldGroup = parentFieldGroup;
          // loop through contentType attributes
          data.contentType.attributes.forEach((attribute, index) => {
            const formlyFieldConfig: FieldConfig = this.loadFieldFromDefinitionTest(attribute, index);
            // if input type is empty-default create new field group and than continue to add fields to that group
            if (attribute.settings.InputType.values[0].value === InputTypesConstants.emptyDefault) {
              const collapsed = attribute.settings.DefaultCollapsed ? attribute.settings.DefaultCollapsed.values[0].value : false;
              currentFieldGroup = this.createEmptyFieldGroup(attribute, collapsed);
              parentFieldGroup.fieldGroup.push(currentFieldGroup);
            } else {
              currentFieldGroup.fieldGroup.push(formlyFieldConfig);
            }
          });
          return of([parentFieldGroup]);
        })
      );
  }

  // TEST
  private loadFieldFromDefinitionTest(attribute: AttributeDef, index: number): FieldConfig {
    if (attribute.settings.InputType.values[0].value === 'custom-gps') {
      console.log('loadFieldFromDefinitionTest attribute:', attribute);
    }

    console.log('loadFieldFromDefinitionTest', attribute.settings.InputType);
    if (attribute.settings.InputType) {

      // if (attribute.settings.InputType.values[0].value.startWith('custom')) {
      //   return this.loadFieldFromDefinition(attribute, InputTypesConstants.external, index);
      // } else {
      //   return this.loadFieldFromDefinition(attribute, attribute.settings.InputType.values[0].value, index);
      // }

      switch (attribute.settings.InputType.values[0].value) {
        case InputTypesConstants.stringDefault:
          return this.loadFieldFromDefinition(attribute, InputTypesConstants.stringDefault, index);
        case InputTypesConstants.stringUrlPath:
          return this.loadFieldFromDefinition(attribute, InputTypesConstants.stringUrlPath, index);
        // return this.loadFieldFromDefinitionStringUrlPath(attribute);
        case InputTypesConstants.booleanDefault:
          return this.loadFieldFromDefinition(attribute, InputTypesConstants.booleanDefault, index);
        // return this.getStringIconFontPickerFormlyField(attribute);
        case InputTypesConstants.stringDropdown:
          return this.loadFieldFromDefinition(attribute, InputTypesConstants.stringDropdown, index);
        // return this.loadFieldFromDefinitionStringDropDown(attribute);
        case InputTypesConstants.datetimeDefault:
          return this.loadFieldFromDefinition(attribute, InputTypesConstants.datetimeDefault, index);
        case InputTypesConstants.numberDefault:
          return this.loadFieldFromDefinition(attribute, InputTypesConstants.numberDefault, index);
        case InputTypesConstants.stringFontIconPicker:
          return this.loadFieldFromDefinition(attribute, InputTypesConstants.stringFontIconPicker, index);
        case InputTypesConstants.entityDefault:
          return this.loadFieldFromDefinition(attribute, InputTypesConstants.entityDefault, index);
        case InputTypesConstants.hyperlinkDefault:
          return this.loadFieldFromDefinition(attribute, InputTypesConstants.hyperlinkDefault, index);
        case InputTypesConstants.hyperlinkLibrary:
          return this.loadFieldFromDefinition(attribute, InputTypesConstants.hyperlinkLibrary, index);
        case InputTypesConstants.external:
        case 'string-wysiwyg':
          return this.loadFieldFromDefinition(attribute, InputTypesConstants.external, index);
        case 'custom-my-field-test':
          return this.loadFieldFromDefinition(attribute, InputTypesConstants.external, index);
        default:
          return this.loadFieldFromDefinition(attribute, InputTypesConstants.stringDefault, index);
      }

    } else {
      return this.loadFieldFromDefinition(attribute, InputTypesConstants.stringDefault, index);
    }
  }

  /**
   * Load formly field from AttributeDef
   * @param attribute
   */
  private loadFieldFromDefinition(attribute: AttributeDef, inputType: string, index: number): FieldConfig {
    // const inputType = InputTypesConstants.stringDefault; // attribute.settings.InputType.values[0].value;
    const settingsTranslated = LocalizationHelper.translateSettings(attribute.settings, this.currentLanguage, this.defaultLanguage);
    // set validation for all input types
    const validationList: ValidatorFn[] = ValidationHelper.setDefaultValidations(settingsTranslated);
    const required = settingsTranslated.Required ? settingsTranslated.Required : false;
    // LocalizationHelper.translate(this.currentLanguage, this.defaultLanguage, attribute.settings.Required, false);
    // attribute.settings.Required ? attribute.settings.Required.values[0].value : false;
    const value = LocalizationHelper.translate(this.currentLanguage, this.defaultLanguage,
      this.item.entity.attributes[attribute.name], null);

    const disabled: boolean = settingsTranslated.Disabled
      ? settingsTranslated.Disabled : (this.isControlDisabledForCurrentLanguage(this.currentLanguage, this.defaultLanguage,
        this.item.entity.attributes[attribute.name], attribute.name));

    // const label = settingsTranslated.Name ? settingsTranslated.Name : null;
    const label = attribute !== null
      ? (settingsTranslated !== null && settingsTranslated.Name) ? settingsTranslated.Name : attribute.name
      : null;

    // LocalizationHelper.translate(this.currentLanguage, this.defaultLanguage, attribute.settings.Name, null);
    return {
      // valueKey: `${attribute.name}.values[0].value`,
      // pattern: pattern,
      disabled: disabled,
      entityId: this.item.entity.id,
      fullSettings: attribute.settings,
      header: this.item.header,
      index: index,
      label: label,
      name: attribute.name,
      placeholder: `Enter ${attribute.name}`, // TODO: need see what to use placeholder or label or both
      required: required,
      settings: settingsTranslated,
      type: inputType, // TODO see do we need this
      validation: validationList,
      value: value,
      wrappers: ['app-hidden-wrapper'],
    };
  }

  /**
   * Determines is control disabled
   * @param currentLanguage
   * @param defaultLanguage
   * @param attributeValues
   * @param attributeKey
   */
  private isControlDisabledForCurrentLanguage(currentLanguage: string, defaultLanguage: string,
    attributeValues: EavValues<any>, attributeKey: string): boolean {
    if (LocalizationHelper.isEditableTranslationExist(attributeValues, currentLanguage, defaultLanguage)) {
      return false;
      // } else if (LocalizationHelper.isReadonlyTranslationExist(attributeValues, currentLanguage)) {
      //   return true;
    } else {
      return true;
    }
  }

  /**
   * Enables all controls in form
   * @param allAttributes
   */
  private enableAllControls(allAttributes: EavAttributes) {
    Object.keys(allAttributes).forEach(attributeKey => {
      if (this.form.value[attributeKey] === undefined) {
        this.form.setDisabled(attributeKey, false, false);
      }
    });
  }

  /**
   * loop trough all controls and set disable control if needed
   * @param allAttributes
   * @param currentLanguage
   * @param defaultLanguage
   */
  private disableControlsForCurrentLanguage(allAttributes: EavAttributes, currentLanguage: string, defaultLanguage: string) {
    Object.keys(this.item.entity.attributes).forEach(attributeKey => {
      const disabled: boolean = this.isControlDisabledForCurrentLanguage(currentLanguage, defaultLanguage,
        this.item.entity.attributes[attributeKey], attributeKey);
      this.form.setDisabled(attributeKey, disabled, false);
    });
  }

  /**
   * Create title field group with collapsible wrapper
   */
  private createEmptyFieldGroup = (attribute: AttributeDef, collapse: boolean): FieldConfig => {
    let settingsTranslated = null;
    if (attribute) {
      settingsTranslated = LocalizationHelper.translateSettings(attribute.settings, this.currentLanguage, this.defaultLanguage);
    }

    return {
      collapse: collapse,
      fieldGroup: [],
      header: this.item.header,
      label: attribute !== null
        ? (settingsTranslated !== null && settingsTranslated.Name) ? settingsTranslated.Name : attribute.name
        : 'Edit Item',
      name: attribute !== null ? attribute.name : 'Edit Item',
      settings: settingsTranslated,
      type: InputTypesConstants.emptyDefault,
      wrappers: ['app-collapsible-wrapper'],
    };
  }
}
