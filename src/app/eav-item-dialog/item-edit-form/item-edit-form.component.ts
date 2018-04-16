import {
  Component, ViewChild, ChangeDetectorRef,
  OnInit, Input, OnChanges, ElementRef, OnDestroy
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
import { of } from 'rxjs/observable/of';

import { AppState } from '../../shared/models';
import { Item, ContentType, EavValue, Language, EavAttributesTranslated } from '../../shared/models/eav';
import { AttributeDef } from '../../shared/models/eav/attribute-def';
import { EavAttributes } from '../../shared/models/eav/eav-attributes';
import { InputTypesConstants } from '../../shared/constants/input-types-constants';
import { ItemService } from '../../shared/services/item.service';
import { ContentTypeService } from '../../shared/services/content-type.service';
import { EavValues } from '../../shared/models/eav/eav-values';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { EavDimensions } from '../../shared/models/eav/eav-dimensions';
import { LocalizationHelper } from '../../shared/helpers/localization-helper';

@Component({
  selector: 'app-item-edit-form',
  templateUrl: './item-edit-form.component.html',
  styleUrls: ['./item-edit-form.component.css']
})
export class ItemEditFormComponent implements OnInit, OnChanges, OnDestroy {
  @ViewChild(EavFormComponent) form: EavFormComponent;
  // @Input() currentLanguage: string;
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
  private defaultLanguage = 'en-us';
  private currentLanguageValue: string;
  private itemBehaviorSubject$: BehaviorSubject<Item> = new BehaviorSubject<Item>(null);
  contentType$: Observable<ContentType>;
  itemFields$: Observable<FieldConfig[]>;

  constructor(
    private itemService: ItemService,
    private contentTypeService: ContentTypeService
    // private ref: ElementRef,
  ) { }

  ngOnInit() {
    console.log('oninit');

    this.itemBehaviorSubject$.subscribe((item: Item) => {
      console.log('subscribe setFormValues start');
      this.setFormValues(item, false);
    });

    this.loadContentTypeFromStore();
    // Observable.fromEvent(this.ref.nativeElement, 'click')
    //   .do(ev => console.log("test 1", ev))
    //   .subscribe();
    // Observable.fromEvent(this.ref.nativeElement, 'changes')
    //   .do(ev => console.log("test", ev))
    //   .subscribe();
  }

  ngOnDestroy(): void {
    this.itemBehaviorSubject$.unsubscribe();
  }

  ngOnChanges(): void {
    console.log('ItemEditFormComponent');
    console.log('imamo current change: ', this.currentLanguage);
  }

  /**
   * Update NGRX/store on form value change
   * @param values key:value list of fields from form
   */
  formValueChange(values: { [key: string]: any }) {
    this.itemService.updateItemAttributesValues(this.item.entity.id, values, this.currentLanguage);
  }

  // TEMP
  changeThis() {
    const values = {
      BooleanDefault: false,
      DateTime: '2018-02-14T20:14:00Z',
      EntityDefault: 'd86677cb-b5cf-40a3-92e4-71c6822adbc6',
      NumberDefault: 5,
      DateTimeWithTime: '2018-02-07T02:03:00Z',
      BooleanGroup1: false,
      DropDownGroup1: '1',
      StringGroup1: 'Ante test',
      StringGroup2: 'ante test2',
      StringUrlPathGroup2: 'ante'
    };

    this.formValueChange(values);
  }

  submit(values: { [key: string]: any }) {
    console.log(values);
  }

  deleteItem() {
    this.itemService.deleteItem(this.item);
  }

  private setFormValues = (item: Item, currentLanguageChanged: boolean) => {
    if (this.form) {
      const formValues: { [name: string]: any } = {};
      Object.keys(item.entity.attributes).forEach(attributeKey => {
        formValues[attributeKey] = LocalizationHelper.translate(this.currentLanguage,
          this.defaultLanguage, item.entity.attributes[attributeKey], null);
      });

      // Important - We need to enable all controls for new language before patchValue and before is determined which control is disabled
      if (currentLanguageChanged) {
        this.enableAllControls(item.entity.attributes);
      }

      if (this.form.valueIsChanged(formValues)) {
        // set new values to form
        this.form.patchValue(formValues, false);
      }

      if (currentLanguageChanged) {
        // loop trough all controls and set disable control if needed
        this.disableControlsForCurrentLanguage(item.entity.attributes, this.currentLanguage);
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
    const settingsTranslated = this.translateSettings(attribute.settings);
    // set validation for all input types
    const validationList: ValidatorFn[] = this.setDefaultValidations(settingsTranslated);
    const required = settingsTranslated.Required ? settingsTranslated.Required : false;
    // LocalizationHelper.translate(this.currentLanguage, this.defaultLanguage, attribute.settings.Required, false);
    // attribute.settings.Required ? attribute.settings.Required.values[0].value : false;
    const value = LocalizationHelper.translate(this.currentLanguage, this.defaultLanguage,
      this.item.entity.attributes[attribute.name], null);

    const disabled: boolean = this.isControlDisabledForCurrentLanguage(this.currentLanguage,
      this.item.entity.attributes[attribute.name], attribute.name);

    const label = settingsTranslated.Name ? settingsTranslated.Name : null;
    // LocalizationHelper.translate(this.currentLanguage, this.defaultLanguage, attribute.settings.Name, null);



    return {
      // valueKey: `${attribute.name}.values[0].value`,
      entityId: this.item.entity.id,
      value: value,
      name: attribute.name,
      type: inputType, // TODO see do we need this
      label: label,
      placeholder: `Enter ${attribute.name}`, // TODO: need see what to use placeholder or label or both
      required: required,
      // pattern: pattern,
      settings: settingsTranslated,
      validation: validationList,
      disabled: disabled
    };
  }

  translateSettings(settings: EavAttributes): EavAttributesTranslated {
    const settingsTranslated: EavAttributesTranslated = new EavAttributesTranslated;
    Object.keys(settings).forEach(attributesKey => {
      console.log('aaaaaaaaaaaaaaaaaaa settingsTranslated[attributesKey]', settingsTranslated[attributesKey]);
      settingsTranslated[attributesKey] = LocalizationHelper.translate(this.currentLanguage,
        this.defaultLanguage, settings[attributesKey], false);
    });

    return settingsTranslated;
  }

  /**
   * Determines is control disabled
   * @param currentLanguage
   * @param attributeValues
   * @param attributeKey
   */
  private isControlDisabledForCurrentLanguage(currentLanguage, attributeValues: EavValues<any>, attributeKey: string): boolean {
    if (LocalizationHelper.isEditableTranslationExist(attributeValues, currentLanguage)) {
      return false;
    } else if (LocalizationHelper.isReadonlyTranslationExist(attributeValues, currentLanguage)) {
      return true;
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
  private disableControlsForCurrentLanguage(allAttributes: EavAttributes, currentLanguage: string) {
    Object.keys(this.item.entity.attributes).forEach(attributeKey => {
      const disabled: boolean = this.isControlDisabledForCurrentLanguage(currentLanguage,
        this.item.entity.attributes[attributeKey], attributeKey);
      this.form.setDisabled(attributeKey, disabled, false);
    });
  }

  /**
   * TODO: see can i write this in module configuration ???
   * @param inputType
   */
  private setDefaultValidations(settings: EavAttributesTranslated): ValidatorFn[] {

    const validation: ValidatorFn[] = [];

    const required = settings.Required ? settings.Required.value : false;
    // LocalizationHelper.translate(this.currentLanguage, this.defaultLanguage, settings.Required, false);
    // settings.Required ? settings.Required.values[0].value : false;
    if (required) {
      validation.push(Validators.required);
    }
    const pattern = settings.ValidationRegex ? settings.ValidationRegex.value : '';
    // LocalizationHelper.translate(this.currentLanguage, this.defaultLanguage, settings.ValidationRegex, '');
    // settings.ValidationRegex ? settings.ValidationRegex.values[0].value : '';
    if (pattern) {
      validation.push(Validators.pattern(pattern));
    }

    // TODO: See do we set this here or in control
    const max = settings.Max ? settings.Max.value : 0;
    // LocalizationHelper.translate(this.currentLanguage, this.defaultLanguage, settings.Max, 0);
    // settings.Max ? settings.Max.values[0].value : 0;
    if (max > 0) {
      validation.push(Validators.max(max));
    }

    // TODO: See do we set this here or in control
    const min = settings.Min ? settings.Min.value : 0;
    // LocalizationHelper.translate(this.currentLanguage, this.defaultLanguage, settings.Min, 0);
    // settings.Min ? settings.Min.values[0].value : 0;
    if (min > 0) {
      validation.push(Validators.min(min));
    }

    // if (inputType === InputTypesConstants.stringUrlPath) {
    //   validation = [...['onlySimpleUrlChars']];
    // }

    return validation;
  }

  /**
   * Create title field group with collapsible wrapper
   * @param title
   * @param collapse
   */
  private createEmptyFieldGroup = (name: string, collapse: boolean): FieldConfig => {
    return {
      name: name,
      type: InputTypesConstants.emptyDefault,
      wrappers: ['app-collapsible-wrapper'],
      label: name,
      collapse: collapse,
      fieldGroup: [],
    };
  }
}
