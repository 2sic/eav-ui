import { Component, OnInit, Input, OnChanges } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Store } from '@ngrx/store';
import { FormGroup } from '@angular/forms';
import { FormlyFieldConfig } from '@ngx-formly/core';
import 'rxjs/add/operator/map';
import { of } from 'rxjs/observable/of';

import { AppState } from '../../shared/models';
import { Item, ContentType } from '../../shared/models/eav';
import { AttributeDef } from '../../shared/models/eav/attribute-def';
import { EavAttributes } from '../../shared/models/eav/eav-attributes';
import { InputTypesConstants } from '../../shared/constants/input-types-constants';
import * as itemActions from '../../shared/store/actions/item.actions';

@Component({
  selector: 'app-item-edit-form',
  templateUrl: './item-edit-form.component.html',
  styleUrls: ['./item-edit-form.component.css']
})
export class ItemEditFormComponent implements OnInit {
  @Input() item: Item;

  // Test
  // contentTypes$: Observable<ContentType[]>;
  // item$: Observable<Item>;

  contentType$: Observable<ContentType>;
  form = new FormGroup({});
  itemFields$: Observable<FormlyFieldConfig[]>;

  constructor(private store: Store<AppState>) { }

  ngOnInit() {
    this.loadContentTypeFromStore();

    // Test
    // this.item$ = this.subscribeItem(this.item);
  }

  // Test
  // subscribeItem(item: Item): Observable<Item> {
  //   return this.store
  //     .select(s => s.items)
  //     .map(data => data.find(obj => obj === item));
  // }

  // Test
  submit(attributes) {
    this.store.dispatch(new itemActions.UpdateItem(this.item));
    console.log(attributes);
  }
  // Test
  change(attributes) {
    this.store.dispatch(new itemActions.UpdateItem(this.item));
    console.log(attributes);
  }

  loadContentTypeFromStore() {
    // Load content type for item from store
    this.contentType$ = this.getContentTypeById(this.item.entity.type.id);
    // create form fields from content type
    this.itemFields$ = this.loadContentTypeFormFields();
  }

  /**
   * Observe content type for item type from store
   * @param id
   */
  getContentTypeById(id: string): Observable<ContentType> {
    return this.store
      .select(s => s.contentTypes)
      .map(data => data.find(obj => obj.contentType.id === id));
  }

  /**
   * load content type attributes to Formly FormFields (formlyFieldConfigArray)
   */
  loadContentTypeFormFields(): Observable<FormlyFieldConfig[]> {
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

  /**
   * Load formly field from AttributeDef
   * @param attribute
   */
  loadFieldFromDefinition(attribute: AttributeDef): FormlyFieldConfig {
    // console.log('attribute', attribute.settings['InputType']);
    console.log('attribute.settings.RowCount', attribute.settings.RowCount);
    const inputType = InputTypesConstants.stringDefault; // attribute.settings.InputType.values[0].value;
    const rowCount = attribute.settings.RowCount ? attribute.settings.RowCount.values[0].value : 1;
    const required = attribute.settings.Required ? attribute.settings.Required.values[0].value : false;

    return {
      key: `${attribute.name}.values[0].value`,
      type: inputType,
      templateOptions: {
        type: 'text',
        rowCount: rowCount,
        label: attribute.name,
        placeholder: `Enter ${attribute.name}`,
        required: required,
      }
    };
  }

  // TEST
  loadFieldFromDefinitionTest(attribute: AttributeDef): FormlyFieldConfig {
    // attribute.settings - are metadata attributes
    // attribute.settings['DefaultValue']
    // attribute.settings['InputType'] "string-default"
    // attribute.settings['Name'] "Title"
    // attribute.settings['Notes']
    // attribute.settings['Disabled'] false
    // attribute.settings['Required'] true
    // attribute.settings['VisibleInEditUI'] true

    if (attribute.settings.InputType) {
      switch (attribute.settings.InputType.values[0].value) {
        case InputTypesConstants.stringDefault:
          return this.loadFieldFromDefinition(attribute);
        case InputTypesConstants.booleanDefault:
          return this.getBooleanDefaultFormlyField(attribute);
        case InputTypesConstants.stringFontIconPicker:
          return this.loadFieldFromDefinition(attribute);
        // return this.getStringIconFontPickerFormlyField(attribute);
        default:
          return this.loadFieldFromDefinition(attribute);
      }
    } else {
      return this.loadFieldFromDefinition(attribute);
    }
  }

  // TEST
  // Example wrappers
  getBooleanDefaultFormlyField(attribute: AttributeDef): FormlyFieldConfig {
    return {
      key: '',
      wrappers: ['label'],
      templateOptions: {
        label: `Wrapper Label ${attribute.name}`
      },
      fieldGroup: [{
        key: `${attribute.name}.values[0].value`,
        type: 'input',
        templateOptions: {
          required: attribute.settings.Required.values[0].value,
          type: 'text',
          label: attribute.name
        },
        // hideExpression: '!model.name',
        // expressionProperties: {
        //   'templateOptions.focus': `${attribute.name}.values[0].value`,
        //   'templateOptions.description': (model, formState) => {
        //     return 'And look! This field magically got focus!';
        //   },
        // },
      }]
    };
  }

  // Test
  // Example nested wrappers
  getStringIconFontPickerFormlyField(attribute: AttributeDef): FormlyFieldConfig {
    return {
      key: '',
      wrappers: ['collapsible'],
      templateOptions: {
        label: `Parent wrapper Collapsible ${attribute.name}`,
        collapse: true
      },
      fieldGroup: [{
        key: '',
        wrappers: ['label'],
        templateOptions: {
          label: `Child wrapper ${attribute.name}`
        },
        fieldGroup: [{
          key: `${attribute.name}.values[0].value`,
          type: 'input',
          templateOptions: {
            required: attribute.settings.Required.values[0].value,
            type: 'text',
            label: attribute.name,
          },
        }]
      }],
    };
  }

  // Test
  // DEFAULT - horizontalInput - not good: without mat-form-field
  getDefaultFormlyField(attribute: AttributeDef): FormlyFieldConfig {
    console.log('rowCount: ', attribute.settings.RowCount ? attribute.settings.RowCount.values[0].value : 1);
    return {
      key: `${attribute.name}.values[0].value`,
      type: InputTypesConstants.stringDefault,
      templateOptions: {
        type: 'text',
        rowCount: attribute.settings.RowCount ? attribute.settings.RowCount.values[0].value : 1,
        label: attribute.name,
        placeholder: `Enter ${attribute.name}`,
        required: true,
      }
    };
  }
}
