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

@Component({
  selector: 'app-item-edit-form',
  templateUrl: './item-edit-form.component.html',
  styleUrls: ['./item-edit-form.component.css']
})
export class ItemEditFormComponent implements OnInit {
  @Input() item: Item;

  // contentTypes$: Observable<ContentType[]>;
  item$: Observable<Item>;
  contentType$: Observable<ContentType>;
  form = new FormGroup({});
  itemFields$: Observable<FormlyFieldConfig[]>;
  // itemFieldss$: FormlyFieldConfig[] = [{ // TODO: our Fields are contentTypes attributes
  //   key: 'FullName.values[0].value',
  //   type: 'input',
  //   templateOptions: {
  //     type: 'text',
  //     label: 'FullName',
  //     placeholder: 'Enter FullName',
  //     required: true,
  //   }
  // },
  // {
  //   key: 'Position.values[0].value',
  //   type: 'input',
  //   templateOptions: {
  //     type: 'text',
  //     label: 'Description',
  //     placeholder: 'Enter description',
  //     required: true,
  //   }
  // },
  // {
  //   key: '',
  //   wrappers: ['panel'],
  //   templateOptions: {
  //     label: 'Parent wrapper Panel'
  //   },
  //   fieldGroup: [{
  //     key: 'Icon.values[0].value',
  //     type: 'input',
  //     templateOptions: {
  //       required: true,
  //       type: 'text',
  //       label: 'Icon',
  //     },
  //   },
  //   {
  //     key: 'Title.values[0].value',
  //     type: 'input',
  //     templateOptions: {
  //       required: true,
  //       type: 'text',
  //       label: 'Title',
  //     },
  //   },
  //   {
  //     key: 'InitiallyExpanded',
  //     wrappers: ['label'],
  //     templateOptions: {
  //       label: 'Child wrapper Label'
  //     },
  //     fieldGroup: [{
  //       key: 'values[0].value',
  //       type: 'input',
  //       templateOptions: {
  //         required: true,
  //         type: 'text',
  //         label: 'Icon',
  //       },
  //     }]
  //   }],
  // }];

  constructor(private store: Store<AppState>) { }

  // Test
  submit(attributes) {
    console.log(attributes);
  }

  ngOnInit() {
    this.loadContentTypeFromStore();
  }

  // ngOnChanges(changes: SimpleChanges) {
  //   if (changes['item']) {
  //     console.log('change:', this.item);
  //   }
  // }

  loadContentTypeFromStore() {
    // Load content type for item$ from store
    // this.contentTypes$ = this.store.select(state => state.contentTypes)
    this.contentType$ = this.fetchContentTypeById(this.item.entity.type.id); // person
    // this.contentType$ = this.fetchContentTypeById('884e65b4-8f1c-4bc9-897f-147dcabeb941'); // accordion
    this.itemFields$ = this.mapContentTypeFields();

    this.item$ = this.getItem(this.item);
  }

  getItem(item: Item): Observable<Item> {
    return this.store
      .select(s => s.items)
      .map(data => data.find(obj => obj === item));
  }

  getItemTypeId(id: string): Observable<ContentType> {
    return this.store
      .select(s => s.contentTypes)
      .map(data => data.find(obj => obj.contentType.id === id));
  }

  /**
   * Load content type for item$ from store
   * @param id
   */
  fetchContentTypeById(id: string): Observable<ContentType> {
    return this.store
      .select(s => s.contentTypes)
      .map(data => data.find(obj => obj.contentType.id === id));
  }

  /**
   * map content type attributes to itemFields (formlyFieldConfigArray)
   */
  mapContentTypeFields(): Observable<FormlyFieldConfig[]> {
    return this.contentType$
      .switchMap((data) => {
        const formlyFieldConfigArray: FormlyFieldConfig[] = new Array<FormlyFieldConfig>();
        // loop through contentType attributes
        data.contentType.attributes.forEach(attribute => {
          const formlyFieldConfig: FormlyFieldConfig = this.getFormlyFieldFromAttributeDef(attribute);

          formlyFieldConfigArray.push(formlyFieldConfig);
        });

        return of(formlyFieldConfigArray);
      });
  }

  /**
   * Get FormlyField from AttributeDef
   * @param attribute
   */
  getFormlyFieldFromAttributeDef(attribute: AttributeDef): FormlyFieldConfig {
    // attribute.settings - are metadata attributes
    // attribute.settings['DefaultValue']
    // attribute.settings['InputType'] "string-default"
    // attribute.settings['Name'] "Title"
    // attribute.settings['Notes']
    // attribute.settings['Disabled'] false
    // attribute.settings['Required'] true
    // attribute.settings['VisibleInEditUI'] true

    if (attribute.settings['InputType']) {
      switch (attribute.settings['InputType'].values[0].value) {
        case 'string-default':
          return this.getStringDefaultFormlyField(attribute);
        case 'boolean-default':
          return this.getBooleanDefaultFormlyField(attribute);
        case 'string-font-icon-picker':
          return this.getStringIconFontPickerFormlyField(attribute);
        default:
          return this.getDefaultFormlyField(attribute);
      }
    } else {
      return this.getDefaultFormlyField(attribute);
    }
  }

  // Example input type without wrapper
  getStringDefaultFormlyField(attribute: AttributeDef): FormlyFieldConfig {
    return {
      key: `${attribute.name}.values[0].value`,
      type: 'input',
      templateOptions: {
        type: 'text',
        label: attribute.name,
        placeholder: `Enter ${attribute.name}`,
        required: attribute.settings['Required'].values[0].value,
      }
    };
  }

  // Example wrappers
  getBooleanDefaultFormlyField(attribute: AttributeDef): FormlyFieldConfig {
    return {
      key: '',
      wrappers: ['label'],
      templateOptions: {
        for: `${attribute.name}.values[0].value`,
        label: `Wrapper Label ${attribute.name}`
      },
      fieldGroup: [{
        key: `${attribute.name}.values[0].value`,
        type: 'input',
        templateOptions: {
          required: attribute.settings['Required'].values[0].value,
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
            required: attribute.settings['Required'].values[0].value,
            type: 'text',
            label: attribute.name,
          },
        }]
      }],
    };
  }

  // DEFAULT - horizontalInput - not good: without mat-form-field
  getDefaultFormlyField(attribute: AttributeDef): FormlyFieldConfig {
    return {
      key: `${attribute.name}.values[0].value`,
      type: 'input',
      templateOptions: {
        type: 'text',
        label: attribute.name,
        placeholder: `Enter ${attribute.name}`,
        required: true,
      }
    };
  }
}

