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
import * as itemActions from '../../shared/store/actions/item.actions';
import { ItemService } from '../../shared/services/item.service';
import { ContentTypeService } from '../../shared/services/content-type.service';

export class EavSettings {
  [key: string]: EavSettingsValue;
}

export class EavSettingsValue {
  value: any;
}

@Component({
  selector: 'app-item-edit-form',
  templateUrl: './item-edit-form.component.html',
  styleUrls: ['./item-edit-form.component.css']
})
export class ItemEditFormComponent implements OnInit {

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
  // Test
  // item$: Observable<Item>;
  contentType$: Observable<ContentType>;
  form = new FormGroup({});
  itemFields$: Observable<FormlyFieldConfig[]>;

  constructor(private itemService: ItemService, private contentTypeService: ContentTypeService) { }

  ngOnInit() {
    this.loadContentTypeFromStore();
    // Test
    // this.item$ = this.itemService.selectItemById(this.selectedItem.entity.id);
  }

  submitForm() {
    if (this.form.valid) {
      console.log('submit');
      this.itemService.updateItem(this.selectedItem); // TODO: probably can update only attributes
    }
  }

  changeForm() {
    if (this.form.valid) {
      this.itemService.updateItem(this.selectedItem); // TODO: probably can update only attributes
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
        const formlyFieldConfigArray: FormlyFieldConfig[] = new Array<FormlyFieldConfig>();
        // loop through contentType attributes
        data.contentType.attributes.forEach(attribute => {
          const formlyFieldConfig: FormlyFieldConfig = this.loadFieldFromDefinitionTest(attribute);

          formlyFieldConfigArray.push(formlyFieldConfig);
        });

        return of(formlyFieldConfigArray);
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
      key: `${attribute.name}.values[0].value`,
      type: inputType,
      templateOptions: {
        type: 'text', // TODO
        label: attribute.name,
        placeholder: `Enter ${attribute.name}`,
        required: required,
        pattern: pattern,
        settings: attribute.settings,
        change: () => this.changeForm(), // this needs for 'select' and 'checkbox' to catch the changes
        ante: (inputType === InputTypesConstants.datetimeDefault) ? 'ima' : null,
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

  // TEST
  // loadFieldFromDefinitionStringUrlPath(attribute: AttributeDef): FormlyFieldConfig {
  //   const inputType = InputTypesConstants.stringUrlPath; // attribute.settings.InputType.values[0].value;
  //   const required = attribute.settings.Required ? attribute.settings.Required.values[0].value : false;

  //   const autoGenerateMask = attribute.settings.AutoGenerateMask ? attribute.settings.AutoGenerateMask.values[0].value : '';
  //   const allowSlashes = attribute.settings.AllowSlashes ? attribute.settings.AllowSlashes.values[0].value : false;

  //   return {
  //     key: `${attribute.name}.values[0].value`,
  //     type: inputType,
  //     templateOptions: {
  //       type: 'text',
  //       label: attribute.name,
  //       placeholder: `Enter ${attribute.name}`,
  //       required: true,
  //     },
  //     validators: {
  //       validation: ['onlySimpleUrlChars'],
  //     },
  //   };
  // }

  // TEST
  // loadFieldFromDefinitionStringDropDown(attribute: AttributeDef): FormlyFieldConfig {
  //   const inputType = InputTypesConstants.stringDropdown; // attribute.settings.InputType.values[0].value;
  //   const required = attribute.settings.Required ? attribute.settings.Required.values[0].value : false;

  //   const enableTextEntry = attribute.settings.EnableTextEntry ? attribute.settings.EnableTextEntry.values[0].value : '';
  //   const dropdownValues = attribute.settings.DropdownValues ? attribute.settings.DropdownValues.values[0].value : '';

  //   // "First\nSecond\nThird"
  //   const options = dropdownValues.split('\n').map(v => ({ label: v, value: v }));

  //   return {
  //     key: `${attribute.name}.values[0].value`,
  //     type: inputType, // select
  //     templateOptions: {
  //       type: 'text',
  //       label: attribute.name,
  //       placeholder: `Enter ${attribute.name}`,
  //       required: true,
  //       freeTextMode: false,
  //       enableTextEntry: enableTextEntry,
  //       options: options,
  //       change: () => this.changeForm(), // this needs for 'select' to catch the changes
  //     },
  //     // validators: {
  //     //   validation: ['onlySimpleUrlChars'],
  //     // },
  //   };
  // }

  // Test
  // loadFieldFromDefinitionBoolean(attribute: AttributeDef): FormlyFieldConfig {
  //   const inputType = InputTypesConstants.booleanDefault; // attribute.settings.InputType.values[0].value;
  //   const required = attribute.settings.Required ? attribute.settings.Required.values[0].value : false;
  //   const validationRegex = attribute.settings.ValidationRegex ? attribute.settings.ValidationRegex.values[0].value : false;

  //   return {
  //     key: `${attribute.name}.values[0].value`,
  //     type: inputType,
  //     templateOptions: {
  //       label: attribute.name,
  //       placeholder: `Enter ${attribute.name}`,
  //       required: required,
  //       pattern: validationRegex,
  //       indeterminate: false,
  //       align: 'start',
  //       change: () => this.changeForm(),
  //     }
  //   };
  // }

  // TEST
  // readSettings(settings: EavAttributes): any {

  //   const settingsValue = new EavSettings();

  //   Object.keys(settings).forEach(settingKey => {
  //     // if (settings[settingKey] && settings[settingKey].values[0].value) {
  //     settingsValue[settingKey] = new EavSettingsValue();
  //     settingsValue[settingKey].value = settings[settingKey].values[0].value;
  //     // }
  //   });

  //   return settingsValue;
  // }



  // TEST
  // Example wrappers
  // getBooleanDefaultFormlyField(attribute: AttributeDef): FormlyFieldConfig {
  //   return {
  //     key: '',
  //     wrappers: ['label'],
  //     templateOptions: {
  //       label: `Wrapper Label ${attribute.name}`
  //     },
  //     fieldGroup: [{
  //       key: `${attribute.name}.values[0].value`,
  //       type: 'input',
  //       templateOptions: {
  //         required: attribute.settings.Required.values[0].value,
  //         type: 'text',
  //         label: attribute.name
  //       },
  //       // hideExpression: '!model.name',
  //       // expressionProperties: {
  //       //   'templateOptions.focus': `${attribute.name}.values[0].value`,
  //       //   'templateOptions.description': (model, formState) => {
  //       //     return 'And look! This field magically got focus!';
  //       //   },
  //       // },
  //     }]
  //   };
  // }

  // Test
  // Example nested wrappers
  // getStringIconFontPickerFormlyField(attribute: AttributeDef): FormlyFieldConfig {
  //   return {
  //     key: '',
  //     wrappers: ['collapsible'],
  //     templateOptions: {
  //       label: `Parent wrapper Collapsible ${attribute.name}`,
  //       collapse: true
  //     },
  //     fieldGroup: [{
  //       key: '',
  //       wrappers: ['label'],
  //       templateOptions: {
  //         label: `Child wrapper ${attribute.name}`
  //       },
  //       fieldGroup: [{
  //         key: `${attribute.name}.values[0].value`,
  //         type: 'input',
  //         templateOptions: {
  //           required: attribute.settings.Required.values[0].value,
  //           type: 'text',
  //           label: attribute.name,
  //         },
  //       }]
  //     }],
  //   };
  // }

  // Test
  // DEFAULT - horizontalInput - not good: without mat-form-field
  // getDefaultFormlyField(attribute: AttributeDef): FormlyFieldConfig {
  //   console.log('rowCount: ', attribute.settings.RowCount ? attribute.settings.RowCount.values[0].value : 1);
  //   return {
  //     key: `${attribute.name}.values[0].value`,
  //     type: InputTypesConstants.stringDefault,
  //     templateOptions: {
  //       type: 'text',
  //       rowCount: attribute.settings.RowCount ? attribute.settings.RowCount.values[0].value : 1,
  //       label: attribute.name,
  //       placeholder: `Enter ${attribute.name}`,
  //       required: true,
  //     }
  //   };
  // }
}
