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
import { Item, ContentType, EavValue } from '../../shared/models/eav';
import { AttributeDef } from '../../shared/models/eav/attribute-def';
import { EavAttributes } from '../../shared/models/eav/eav-attributes';
import { InputTypesConstants } from '../../shared/constants/input-types-constants';
import { ItemService } from '../../shared/services/item.service';
import { ContentTypeService } from '../../shared/services/content-type.service';
import { EavValues } from '../../shared/models/eav/eav-values';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { EavDimensions } from '../../shared/models/eav/eav-dimensions';

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
    this.setFormValues(this.item);
  }
  get currentLanguage(): string {
    // console.log('get item: ', this.itemBehaviorSubject$.getValue());
    return this.currentLanguageValue;
  }

  @Input()
  set item(value: Item) {
    console.log('set item');
    this.itemBehaviorSubject$.next(value);
  }
  get item(): Item {
    // console.log('get item: ', this.itemBehaviorSubject$.getValue());
    return this.itemBehaviorSubject$.getValue();
  }

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
    console.log('imamo current: ', this.currentLanguage);

    this.itemBehaviorSubject$.subscribe((item: Item) => {
      console.log('subscribe setFormValues start');
      this.setFormValues(item);
    });

    this.loadContentTypeFromStore();
    // Observable.fromEvent(this.ref.nativeElement, 'click')
    //   .do(ev => console.log("test 1", ev))
    //   .subscribe();
    // Observable.fromEvent(this.ref.nativeElement, 'changes')
    //   .do(ev => console.log("test", ev))
    //   .subscribe();
    console.log('oninit');
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
  formValueChange(values: { [key: string]: any }) { // Need to update specific language or create another dimension
    // copy attributes from item
    const eavAttributes: EavAttributes = new EavAttributes();
    console.log('EavAttributes update item before1', values);
    console.log('EavAttributes update item before', this.item.entity.attributes);

    Object.keys(this.item.entity.attributes).forEach(attributeKey => {
      const eavAttribute = this.item.entity.attributes[attributeKey];
      // const eavValueList: EavValue<any>[] = [];
      const newItemValue = values[attributeKey];

      // if new value exist update attribute for current language
      if (newItemValue) {
        eavAttributes[attributeKey] = {
          ...eavAttribute, values: eavAttribute.values.map(eavValue => {
            // console.log('aaaaaaaaaaaaaaaaaaaaaaaaaaa', eavValue);
            // console.log('aaaaaaaaaaaaaaaaaaaaaaaaaaa1', this.currentLanguage);
            // console.log('aaaaaaaaaaaaaaaaaaaaaaaaaaa2', eavValue.dimensions.find(d => d.value === this.currentLanguage));
            return eavValue.dimensions.find(d => d.value === this.currentLanguage)
              // Update value for current language
              ? {
                ...eavValue,
                value: newItemValue,
              }
              : eavValue;
            // {
            //   ...eavValue,
            //   value: newItemValue,
            //   dimensions: eavValue.dimensions.concat({ value: this.currentLanguage }) //  {value: this.currentLanguage }
            // };
          })
        };
      } else { // else copy item attributes
        eavAttributes[attributeKey] = eavAttribute;   // new EavValues(eavAttribute.values);
      }
    });




    console.log('EavAttributes update', eavAttributes);
    // const eavAttributes: EavAttributes = EavAttributes.createFromDictionary(values, this.currentLanguage);
    if (Object.keys(eavAttributes).length > 0) {
      this.itemService.updateItem(eavAttributes, this.item.entity.id);
    }
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

    // const eavAttributes = EavAttributes.createFromDictionary(values);
    // if (Object.keys(eavAttributes).length > 0) {
    //   this.itemService.updateItem(eavAttributes, this.item.entity.id);
    // }
  }

  submit(values: { [key: string]: any }) {
    console.log(values);
  }

  deleteItem() {
    this.itemService.deleteItem(this.item); // TODO: probably can update only attributes
  }

  /**
    * Create formValue dictionary from EavAttributes
    */
  // private setFormValues = (item: Item) => { //: { [key: string]: any }
  //   //const formValues: { [key: string]: any } = {};
  //   console.log('minjam item', item);
  //   Object.keys(item.entity.attributes).forEach(valueKey => {
  //     //formValues[valueKey] = item.entity.attributes[valueKey].values[0].valuež
  //     //if (this.form) {
  //       this.form.setValue(valueKey, item.entity.attributes[valueKey].values[0].value, false)
  //     //}
  //   })

  //   //return formValues;
  // };

  private setFormValues = (item: Item) => {
    if (this.form) {
      const formValues: { [name: string]: any } = {};
      Object.keys(item.entity.attributes).forEach(valueKey => {

        // formValues[valueKey] = item.entity.attributes[valueKey].values[0].value;
        console.log('setFormValues', this.currentLanguage);
        formValues[valueKey] = this.translate(this.currentLanguage, item.entity.attributes[valueKey].values);
      });

      this.form.patchValue(formValues, false);
    }
  }

  // probably dont need this
  // getAttributeValueForCurrentLanguage(currentLanguage: string, values: EavValue<any>[]): EavValue<any> {
  //   const translations: EavValue<any>[] = values.filter(c => c.dimensions.find(f => f.value === currentLanguage));

  //   if (translations.length > 0) {
  //     console.log('getAttributeValueForCurrentLanguage value', translations[0].value);
  //     return translations[0];
  //   } else {
  //     console.log('getAttributeValueForCurrentLanguage value1', values[0].value);
  //     return values[0]; // TODO: get default language value ???
  //   }
  // }

  // TODO: this can go in localization helper
  translate(currentLanguage: string, values: EavValue<any>[]): string {
    const translations: EavValue<any>[] = values.filter(c => c.dimensions.find(f => f.value === currentLanguage));

    if (translations.length > 0) {
      console.log('setFormValues translate value', translations[0].value);
      return translations[0].value;
    } else {
      console.log('setFormValues translate value1', values[0].value);
      return values[0].value; // TODO: get default language value ???
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

    // set validation for all input types
    const validationList: ValidatorFn[] = this.setDefaultValidations(attribute.settings);
    const required = attribute.settings.Required ? attribute.settings.Required.values[0].value : false;
    const value = this.getValueFromItem(attribute.name);

    return {
      // valueKey: `${attribute.name}.values[0].value`,
      entityId: this.item.entity.id,
      value: value,
      name: attribute.name,
      type: inputType, // TODO see do we need this
      label: attribute.name,
      placeholder: `Enter ${attribute.name}`, // TODO: need see what to use placeholder or label or both
      required: required,
      // pattern: pattern,
      settings: attribute.settings,
      // change: () => this.changeForm(), // this needs for 'select' and 'checkbox' to catch the change
      validation: validationList
      // disable: //TODO see do we need this
    };
  }

  /**
   * Get value from item by attribute name
   */
  private getValueFromItem = (attributeName: string): any => {
    return this.item.entity.attributes[attributeName]
      // ? this.item.entity.attributes[attributeName].values)0].value
      ? this.translate(this.currentLanguage, this.item.entity.attributes[attributeName].values)
      : null;
  }

  /**
   * TODO: see can i write this in module configuration ???
   * @param inputType
   */
  private setDefaultValidations(settings: EavAttributes): ValidatorFn[] {

    const validation: ValidatorFn[] = [];

    const required = settings.Required ? settings.Required.values[0].value : false;
    if (required) {
      validation.push(Validators.required);
    }
    const pattern = settings.ValidationRegex ? settings.ValidationRegex.values[0].value : '';
    if (pattern) {
      validation.push(Validators.pattern(pattern));
    }

    // TODO: See do we set this here or in control
    const max = settings.Max ? settings.Max.values[0].value : 0;
    if (max > 0) {
      validation.push(Validators.max(max));
    }

    // TODO: See do we set this here or in control
    const min = settings.Min ? settings.Min.values[0].value : 0;
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
