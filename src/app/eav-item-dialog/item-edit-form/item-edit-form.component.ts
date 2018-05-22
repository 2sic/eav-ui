import {
  Component, ViewChild, ChangeDetectorRef,
  OnInit, Input, OnChanges, ElementRef, OnDestroy, EventEmitter, Output
} from '@angular/core';
import { Validators, ValidatorFn } from '@angular/forms';
import { Observable } from 'rxjs/Observable';
import { FormGroup } from '@angular/forms';

// TODO: fix this dependency - from other module - move maybe to shared
import { FieldConfig } from '../../eav-dynamic-form/model/field-config';
// TODO: fix this dependency
import { EavFormComponent } from '../../eav-dynamic-form/components/eav-form/eav-form.component';

import 'rxjs/add/operator/map';
import 'rxjs/add/operator/do';
import 'rxjs/add/observable/fromEvent';
import 'rxjs/add/operator/switchmap';
import { filter } from 'rxjs/operators';
import { of } from 'rxjs/observable/of';

import { AppState } from '../../shared/models';
import {
  Item, ContentType, EavValue, Language, EavAttributesTranslated,
  EavAttributes, EavValues, EavDimensions
} from '../../shared/models/eav';
import { AttributeDef } from '../../shared/models/eav/attribute-def';
import { InputTypesConstants } from '../../shared/constants/input-types-constants';
import { ItemService } from '../../shared/services/item.service';
import { ContentTypeService } from '../../shared/services/content-type.service';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { LocalizationHelper } from '../../shared/helpers/localization-helper';
import { ValidationHelper } from '../../eav-material-controls/validators/validation-helper';
import { EavService } from '../../shared/services/eav.service';
import { Actions } from '@ngrx/effects';
import { Subscription } from 'rxjs/Subscription';
import * as fromItems from '../../shared/store/actions/item.actions';
import { Action } from '@ngrx/store';



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
    console.log('set currentLanguage');
    this.currentLanguageValue = value;
    this.setFormValues(this.item, true);
  }
  get currentLanguage(): string {
    return this.currentLanguageValue;
  }

  @Input()
  set item(value: Item) {
    console.log('set item');
    this.itemBehaviorSubject$.next(value);
  }
  get item(): Item {
    return this.itemBehaviorSubject$.getValue();
  }

  // TODO: read default language
  // private defaultLanguage = 'en-us';
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
  ) { }

  ngOnInit() {
    console.log('oninit');

    this.itemBehaviorSubject$.subscribe((item: Item) => {
      console.log('subscribe setFormValues start');
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
      console.log('FORM VALUE CHANGE', values);
      this.itemService.updateItemAttributesValues(this.item.entity.id, values, this.currentLanguage, this.defaultLanguage);
    }

    // emit event to perent
    this.itemFormValueChange.emit();
  }

  // TEMP - TEST
  // changeThis() {
  //   const values = {
  //     BooleanDefault: false,
  //     DateTime: '2018-02-14T20:14:00Z',
  //     EntityDefault: 'd86677cb-b5cf-40a3-92e4-71c6822adbc6',
  //     NumberDefault: 5,
  //     DateTimeWithTime: '2018-02-07T02:03:00Z',
  //     BooleanGroup1: false,
  //     DropDownGroup1: '1',
  //     StringGroup1: 'Ante test',
  //     StringGroup2: 'ante test2',
  //     StringUrlPathGroup2: 'ante'
  //   };

  //   this.formValueChange(values);
  // }

  submit(values: { [key: string]: any }) {
    console.log('submit item edit');
    console.log(values);

    if (this.form.form.valid) {
      // TODO create body for submit
      // TODO read appId
      this.eavService.saveItem(15, this.item, values, this.currentLanguage, this.defaultLanguage);
    }
  }

  // deleteItem() {
  //   this.itemService.deleteItem(this.item);
  // }

  private setFormValues = (item: Item, currentLanguageChanged: boolean) => {
    console.log('setFormValues: currentLanguageChanged:', currentLanguageChanged);
    if (this.form) {
      const formValues: { [name: string]: any } = {};
      Object.keys(item.entity.attributes).forEach(attributeKey => {
        formValues[attributeKey] = LocalizationHelper.translate(this.currentLanguage,
          this.defaultLanguage, item.entity.attributes[attributeKey], null);
      });

      // Important - We need to enable all controls for new language before patchValue and before is determined which control is disabled
      if (currentLanguageChanged) {
        console.log('[COPY ALL] setFormValues enableALL');
        this.enableAllControls(item.entity.attributes);
      }

      if (this.form.valueIsChanged(formValues)) {
        console.log('[COPY ALL] setFormValues valueIsChanged');
        // set new values to form
        this.form.patchValue(formValues, false);
      }

      if (currentLanguageChanged) {
        console.log('[COPY ALL] setFormValues disable all');
        // loop trough all controls and set disable control if needed
        this.disableControlsForCurrentLanguage(item.entity.attributes, this.currentLanguage, this.defaultLanguage);
      }
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
      .switchMap((data) => {
        const parentFieldGroup = this.createEmptyFieldGroup('Edit item', false);
        let currentFieldGroup = parentFieldGroup;
        // loop through contentType attributes
        data.contentType.attributes.forEach(attribute => {
          const formlyFieldConfig: FieldConfig = this.loadFieldFromDefinitionTest(attribute);
          // if input type is empty-default create new field group and than continue to add fields to that group
          if (attribute.settings.InputType.values[0].value === InputTypesConstants.emptyDefault) {
            const collapsed = attribute.settings.DefaultCollapsed ? attribute.settings.DefaultCollapsed.values[0].value : false;
            currentFieldGroup = this.createEmptyFieldGroup(attribute.name, collapsed);
            parentFieldGroup.fieldGroup.push(currentFieldGroup);
          } else {
            currentFieldGroup.fieldGroup.push(formlyFieldConfig);
          }
        });
        return of([parentFieldGroup]);
      });
  }

  // TEST
  private loadFieldFromDefinitionTest(attribute: AttributeDef): FieldConfig {
    console.log('loadFieldFromDefinitionTest', attribute.settings.InputType);
    if (attribute.settings.InputType) {
      switch (attribute.settings.InputType.values[0].value) {
        case InputTypesConstants.stringDefault:
          return this.loadFieldFromDefinition(attribute, InputTypesConstants.stringDefault);
        case InputTypesConstants.stringUrlPath:
          return this.loadFieldFromDefinition(attribute, InputTypesConstants.stringUrlPath);
        // return this.loadFieldFromDefinitionStringUrlPath(attribute);
        case InputTypesConstants.booleanDefault:
          return this.loadFieldFromDefinition(attribute, InputTypesConstants.booleanDefault);
        // return this.getStringIconFontPickerFormlyField(attribute);
        case InputTypesConstants.stringDropdown:
          return this.loadFieldFromDefinition(attribute, InputTypesConstants.stringDropdown);
        // return this.loadFieldFromDefinitionStringDropDown(attribute);
        case InputTypesConstants.datetimeDefault:
          return this.loadFieldFromDefinition(attribute, InputTypesConstants.datetimeDefault);
        case InputTypesConstants.numberDefault:
          return this.loadFieldFromDefinition(attribute, InputTypesConstants.numberDefault);
        case InputTypesConstants.stringFontIconPicker:
          return this.loadFieldFromDefinition(attribute, InputTypesConstants.stringFontIconPicker);
        case InputTypesConstants.entityDefault:
          return this.loadFieldFromDefinition(attribute, InputTypesConstants.entityDefault);
        case InputTypesConstants.hyperlinkDefault:
          return this.loadFieldFromDefinition(attribute, InputTypesConstants.hyperlinkDefault);
        case InputTypesConstants.external:
          // case 'custom-gps':
          return this.loadFieldFromDefinition(attribute, InputTypesConstants.external);
        default:
          return this.loadFieldFromDefinition(attribute, InputTypesConstants.stringDefault);
      }
    } else {
      return this.loadFieldFromDefinition(attribute, InputTypesConstants.stringDefault);
    }
  }

  /**
   * Load formly field from AttributeDef
   * @param attribute
   */
  private loadFieldFromDefinition(attribute: AttributeDef, inputType: string): FieldConfig {
    // const inputType = InputTypesConstants.stringDefault; // attribute.settings.InputType.values[0].value;
    const settingsTranslated = LocalizationHelper.translateSettings(attribute.settings, this.currentLanguage, this.defaultLanguage);
    // set validation for all input types
    const validationList: ValidatorFn[] = ValidationHelper.setDefaultValidations(settingsTranslated);
    const required = settingsTranslated.Required ? settingsTranslated.Required : false;
    // LocalizationHelper.translate(this.currentLanguage, this.defaultLanguage, attribute.settings.Required, false);
    // attribute.settings.Required ? attribute.settings.Required.values[0].value : false;
    const value = LocalizationHelper.translate(this.currentLanguage, this.defaultLanguage,
      this.item.entity.attributes[attribute.name], null);

    const disabled: boolean = this.isControlDisabledForCurrentLanguage(this.currentLanguage, this.defaultLanguage,
      this.item.entity.attributes[attribute.name], attribute.name);

    const label = settingsTranslated.Name ? settingsTranslated.Name : null;
    // LocalizationHelper.translate(this.currentLanguage, this.defaultLanguage, attribute.settings.Name, null);
    return {
      // valueKey: `${attribute.name}.values[0].value`,
      entityId: this.item.entity.id,
      // header: this.item.header,
      value: value,
      name: attribute.name,
      type: inputType, // TODO see do we need this
      label: label,
      placeholder: `Enter ${attribute.name}`, // TODO: need see what to use placeholder or label or both
      required: required,
      // pattern: pattern,
      settings: settingsTranslated,
      fullSettings: attribute.settings,
      validation: validationList,
      disabled: disabled
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
   * @param title
   * @param collapse
   */
  private createEmptyFieldGroup = (name: string, collapse: boolean): FieldConfig => {
    return {
      name: name,
      header: this.item.header,
      type: InputTypesConstants.emptyDefault,
      wrappers: ['app-collapsible-wrapper'],
      label: name,
      collapse: collapse,
      fieldGroup: [],
    };
  }
}
