import { Component, OnInit, Input, OnChanges } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { FormGroup } from '@angular/forms';
import { FormlyFieldConfig } from '@ngx-formly/core';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/switchmap';
import { of } from 'rxjs/observable/of';

import { AppState } from '../../shared/models';
import { Item, ContentType } from '../../shared/models/eav';
import { AttributeDef } from '../../shared/models/eav/attribute-def';
import { EavAttributes } from '../../shared/models/eav/eav-attributes';
import { InputTypesConstants } from '../../shared/constants/input-types-constants';
// import * as itemActions from '../../shared/store/actions/item.actions';
import { ItemService } from '../../shared/services/item.service';
import { ContentTypeService } from '../../shared/services/content-type.service';

export class EavSettings {
  [key: string]: EavSettingsValue;
}

export class EavSettingsValue {
  value: Item;
}

@Component({
  selector: 'app-item-edit-form',
  templateUrl: './item-edit-form.component.html',
  styleUrls: ['./item-edit-form.component.css']
})
export class ItemEditFormComponent implements OnInit, OnChanges {
  /**
   * Item is copied because we don't want to keep the reference to store
   * ngrx store should be changed only through despaches and reducers
   */
  @Input('item')
  set item(value: Item) {
    // this.selectedItem = Object.assign({}, value);
    // this.selectedItem = { ...value };
    this.selectedItem = JSON.parse(JSON.stringify(value));
  }

  selectedItem: Item;
  contentType$: Observable<ContentType>;
  form = new FormGroup({});
  itemFields$: Observable<FormlyFieldConfig[]>;
  model: EavAttributes = {};

  constructor(private itemService: ItemService, private contentTypeService: ContentTypeService) { }

  ngOnInit() {
    this.loadContentTypeFromStore();
    console.log('oninit');
  }

  ngOnChanges(): void {
    //TODO: TRY catch canges
    // this.form.valueChanges.subscribe(val => {
    //   console.log('aha tu si', val)
    // });
  }

  // addAttributes() {
  //   console.log('patchValue', this.selectedItem.entity.attributes)
  //   this.form.patchValue(this.selectedItem.entity.attributes);
  //   // this.model = this.selectedItem.entity.attributes;
  // }

  submitForm() {
    if (this.form.valid) {
      console.log('submit');
      this.itemService.updateItem(this.selectedItem.entity.attributes, this.selectedItem.entity.id); // TODO: probably can update only attributes
    }
  }


  changeForm() {
    if (this.form.valid) {
      this.itemService.updateItem(this.form.value, this.selectedItem.entity.id); // TODO: probably can update only attributes
    }
  }

  deleteItem() {
    this.itemService.deleteItem(this.selectedItem); // TODO: probably can update only attributes
  }

  loadContentTypeFromStore() {
    // Load content type for item from store
    this.contentType$ = this.contentTypeService.getContentTypeById(this.selectedItem.entity.type.id);
    // create form fields from content type
    this.itemFields$ = this.loadContentTypeFormFields();
  }

  /**
   * load content type attributes to Formly FormFields (formlyFieldConfigArray)
   */
  loadContentTypeFormFields = (): Observable<FormlyFieldConfig[]> => {
    return this.contentType$
      .switchMap((data) => {
        const parentFieldGroup = this.createEmptyFieldGroup('Edit item', false);
        let currentFieldGroup = parentFieldGroup;
        // loop through contentType attributes
        data.contentType.attributes.forEach(attribute => {
          const formlyFieldConfig: FormlyFieldConfig = this.loadFieldFromDefinitionTest(attribute);
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
  loadFieldFromDefinitionTest(attribute: AttributeDef): FormlyFieldConfig {
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
  loadFieldFromDefinition(attribute: AttributeDef, inputType: string): FormlyFieldConfig {
    // const inputType = InputTypesConstants.stringDefault; // attribute.settings.InputType.values[0].value;
    const required = attribute.settings.Required ? attribute.settings.Required.values[0].value : false;
    const pattern = attribute.settings.ValidationRegex ? attribute.settings.ValidationRegex.values[0].value : '';
    // set validation for all input types
    const validationList = this.setValidations(inputType);

    return {
      key: `${attribute.name}.values[0].value`,//.values[0].value
      type: inputType,
      templateOptions: {
        type: 'text', // TODO
        label: attribute.name,
        // placeholder: `Enter ${attribute.name}`,
        required: required,
        pattern: pattern,
        settings: attribute.settings,
        change: () => this.changeForm(), // this needs for 'select' and 'checkbox' to catch the change
      },
      validators: {
        validation: validationList,
      },
    };
  }

  /**
   * TODO: see can i write this in module configuration ???
   * @param inputType
   */
  setValidations(inputType: string): Array<string> {
    let validation = Array<string>();
    if (inputType === InputTypesConstants.stringUrlPath) {
      validation = [...['onlySimpleUrlChars']];
    }

    return validation;
  }

  /**
   * Create title field group with collapsible wrapper
   * @param title 
   * @param collapse 
   */
  createEmptyFieldGroup = (title: string, collapse: boolean): FormlyFieldConfig => {
    return {
      key: ``,
      wrappers: ['collapsible'],
      templateOptions: {
        label: title,
        collapse: collapse
      },
      fieldGroup: [],
    };
  }
}
