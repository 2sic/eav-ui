import { Component, ViewChild, AfterViewInit, ChangeDetectorRef, OnInit, Input, OnChanges } from '@angular/core';
import { Validators, ValidatorFn } from '@angular/forms';
import { Observable } from 'rxjs/Observable';
import { FormGroup } from '@angular/forms';

// import { FieldConfig } from './' './dynamic-form/models/field-config.interface';
// import { DynamicFormComponent } from  './dynamic-form/containers/dynamic-form/dynamic-form.component';
//TODO: fix this dependency - from other module - move maybe to shared
import { FieldConfig } from '../../eav-dynamic-form/model/field-config.interface';
//TODO: fix this dependency 
import { EavFormComponent } from '../../eav-dynamic-form/components/eav-form/eav-form.component';

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

@Component({
  selector: 'app-new-item-form',
  templateUrl: './new-item-form.component.html',
  styleUrls: ['./new-item-form.component.css']
})
export class NewItemFormComponent implements AfterViewInit {
  @ViewChild(EavFormComponent) form: EavFormComponent;

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
  // form = new FormGroup({});
  itemFields$: Observable<FieldConfig[]>;
  model: EavAttributes = {};

  constructor(private itemService: ItemService,
    private contentTypeService: ContentTypeService,
    private cdRef: ChangeDetectorRef) { }

  // config: FieldConfig[] = [
  //   {
  //     type: 'input',
  //     label: 'Full name',
  //     name: 'name',
  //     placeholder: 'Enter your name',
  //     validation: [Validators.required, Validators.minLength(4)]
  //   },
  //   {
  //     type: 'input',
  //     label: 'Last name',
  //     name: 'lastname',
  //     placeholder: 'Enter your name2',
  //     validation: [Validators.required, Validators.minLength(4)]
  //   }
  // ];
  config: FieldConfig[] = [
    {
      name: "first empty",
      type: "empty-default",
      wrappers: [
        "collapsible"
      ],
      label: "Edit item",
      collapse: false,
      fieldGroup: [
        {
          value: "ante",
          name: "FirstValue",
          type: "app-string-default",
          label: "StringDefault",
          placeholder: "Enter StringDefault",
          required: false,
          pattern: "",
          validation: [Validators.required, Validators.minLength(5)],
          settings: {
            InputType: {
              values: [
                {
                  value: "string-default",
                  dimensions: []
                }
              ]
            },
            RowCount: {
              values: [
                {
                  value: 3,
                  dimensions: []
                }
              ]
            },
            Name: {
              values: [
                {
                  value: "StringDefault",
                  dimensions: []
                }
              ]
            },
            Required: {
              values: [
                {
                  value: true,
                  dimensions: []
                }
              ]
            },
            VisibleInEditUI: {
              values: [
                {
                  value: true,
                  dimensions: []
                }
              ]
            }
          }
        },
        {
          value: "ante",
          name: "SecondValue",
          type: "app-string-default",
          label: "SecondValue",
          placeholder: "Enter SecondValue",
          required: true,
          pattern: "",
          validation: [Validators.required, Validators.minLength(5)],
          settings: {
            InputType: {
              values: [
                {
                  value: "string-default",
                  dimensions: []
                }
              ]
            },
            RowCount: {
              values: [
                {
                  value: 3,
                  dimensions: []
                }
              ]
            },
            Name: {
              values: [
                {
                  value: "StringDefault",
                  dimensions: []
                }
              ]
            },
            Required: {
              values: [
                {
                  value: true,
                  dimensions: []
                }
              ]
            },
            VisibleInEditUI: {
              values: [
                {
                  value: true,
                  dimensions: []
                }
              ]
            }
          },
        },
        {
          name: "Empty",
          type: "app-empty-default",
          label: "EmptyDefault",
          placeholder: "Enter EmptyDefault",
          collapse: false,
          fieldGroup: [
            {
              value: "new group",
              name: "ThirdValue",
              type: "app-string-default",
              label: "ThirdValue",
              placeholder: "Enter ThirdValue",
              required: true,
              pattern: "",
              validation: [Validators.required, Validators.minLength(10)],
              settings: {
                InputType: {
                  values: [
                    {
                      value: "string-default",
                      dimensions: []
                    }
                  ]
                },
                RowCount: {
                  values: [
                    {
                      value: 1,
                      dimensions: []
                    }
                  ]
                },
                Name: {
                  values: [
                    {
                      value: "StringDefault",
                      dimensions: []
                    }
                  ]
                },
                Required: {
                  values: [
                    {
                      value: true,
                      dimensions: []
                    }
                  ]
                },
                VisibleInEditUI: {
                  values: [
                    {
                      value: true,
                      dimensions: []
                    }
                  ]
                }
              }
            }
          ]
        }
      ]
    },
    {
      name: "third empty",
      type: "empty-default",
      wrappers: [
        "collapsible"
      ],
      label: "Edit item",
      collapse: false,
      fieldGroup: [
        {
          value: "ante",
          name: "thirdGroupValue",
          type: "app-string-default",
          label: "StringDefault",
          placeholder: "Enter StringDefault",
          required: true,
          pattern: "",
          validation: [Validators.required, Validators.minLength(5)],
          settings: {
            InputType: {
              values: [
                {
                  value: "string-default",
                  dimensions: []
                }
              ]
            },
            RowCount: {
              values: [
                {
                  value: 3,
                  dimensions: []
                }
              ]
            },
            Name: {
              values: [
                {
                  value: "StringDefault",
                  dimensions: []
                }
              ]
            },
            Required: {
              values: [
                {
                  value: true,
                  dimensions: []
                }
              ]
            },
            VisibleInEditUI: {
              values: [
                {
                  value: true,
                  dimensions: []
                }
              ]
            }
          }
        }
      ]
    }
  ];

  ngAfterViewInit() {
    // let previousValid = this.form.valid;
    // this.form.changes.subscribe(() => {
    //   if (this.form.valid !== previousValid) {
    //     previousValid = this.form.valid;
    //     //this.form.setDisabled('submit', !previousValid);
    //   }
    // });

    //this.form.setDisabled('submit', true);

    //this.form.setValue('app-string-default', 'Ante');
    // this.form.setValue('lastname', 'Gadzo');
    // needed to add explicit setect changes to solve error

    this.cdRef.detectChanges();
  }

  submit(value: { [name: string]: any }) {
    console.log(value);
  }

  ngOnInit() {
    this.loadContentTypeFromStore();
    console.log('oninit');
  }

  ngOnChanges(): void {
    //TODO: TRY catch canges
    // this.form.valueChanges.subscribe(val => {
    //   console.log('aha tu si', val)
    // });
    console.log('form:', this.form);
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
    console.log('asdsadsadadadad');
    // create form fields from content type
    this.itemFields$ = this.loadContentTypeFormFields();

  }

  /**
   * load content type attributes to Formly FormFields (formlyFieldConfigArray)
   */
  loadContentTypeFormFields = (): Observable<FieldConfig[]> => {
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
  loadFieldFromDefinitionTest(attribute: AttributeDef): FieldConfig {
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
  loadFieldFromDefinition(attribute: AttributeDef, inputType: string): FieldConfig {
    // const inputType = InputTypesConstants.stringDefault; // attribute.settings.InputType.values[0].value;

    // set validation for all input types
    const validationList: ValidatorFn[] = this.setValidations(attribute, inputType);
    const value = this.getValueFromItem(attribute.name);

    return {
      //valueKey: `${attribute.name}.values[0].value`,
      value: value,
      name: attribute.name,
      type: inputType, // TODO see do we need this
      label: attribute.name,
      placeholder: `Enter ${attribute.name}`, // TODO: need see what to use placeholder or label or both
      // required: required,
      // pattern: pattern,
      settings: attribute.settings,
      //change: () => this.changeForm(), // this needs for 'select' and 'checkbox' to catch the change

      validation: validationList
      //disable: //TODO see do we need this
    };
  }

  /**
   * Get value from item by attribute name
   */
  getValueFromItem = (attributeName: string): ValidatorFn[] => {
    return this.selectedItem.entity.attributes[attributeName]
      ? this.selectedItem.entity.attributes[attributeName].values[0].value
      : null;
  }

  /**
   * TODO: see can i write this in module configuration ???
   * @param inputType
   */
  setValidations(attribute: AttributeDef, inputType: string): ValidatorFn[] {

    let validation: ValidatorFn[];

    const required = attribute.settings.Required ? attribute.settings.Required.values[0].value : false;
    if (required) {
      validation = [...[Validators.required]];
    }
    const pattern = attribute.settings.ValidationRegex ? attribute.settings.ValidationRegex.values[0].value : '';
    if (pattern) {
      validation = [...[Validators.pattern(pattern)]];
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
  createEmptyFieldGroup = (name: string, collapse: boolean): FieldConfig => {
    return {
      //key: ``,
      name: name,
      type: InputTypesConstants.emptyDefault,
      wrappers: ['collapsible'],
      //templateOptions: {
      label: name,
      collapse: collapse,
      //},
      fieldGroup: [],
    };
  }


}
