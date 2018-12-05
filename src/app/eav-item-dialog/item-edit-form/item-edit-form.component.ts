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
  EavAttributesTranslated,
  EavHeader,
  Item,
  EavAttributes,
} from '../../shared/models/eav';
import { Actions, ofType } from '@ngrx/effects';
import { AttributeDef } from '../../shared/models/eav/attribute-def';
import { ContentTypeService } from '../../shared/services/content-type.service';
import { EavFormComponent } from '../../eav-dynamic-form/components/eav-form/eav-form.component';
import { EavService } from '../../shared/services/eav.service';
import { Feature } from '../../shared/models/feature/feature';
import { FieldConfig } from '../../eav-dynamic-form/model/field-config';
import { InputTypesConstants } from '../../shared/constants/input-types-constants';
import { ItemService } from '../../shared/services/item.service';
import { LocalizationHelper } from '../../shared/helpers/localization-helper';
import { ValidationHelper } from '../../eav-material-controls/validators/validation-helper';
import * as fromItems from '../../shared/store/actions/item.actions';
import isEmpty from 'lodash/isEmpty';

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
    const asd = this.checkAreAllControlsDisabled();
    return asd;
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

  ngOnDestroy(): void {
    this.itemBehaviorSubject$.unsubscribe();
  }

  ngOnChanges(): void { }

  /** Observe is item form is saved */
  formSaveObservable(): Observable<Action> {
    return this.actions$
      .ofType(fromItems.SAVE_ITEM_ATTRIBUTES_VALUES)
      .pipe(filter((action: fromItems.SaveItemAttributesValuesAction) =>
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
      this.eavService.saveItem(this.eavConfig.appId, this.item, values, this.currentLanguage, this.defaultLanguage);
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
    // Load content type for item from store
    this.contentType$ = this.contentTypeService.getContentTypeById(
      this.item.entity.type === null
        ? this.item.header.contentTypeName
        : this.item.entity.type.id
    );
    // create form fields from content type
    this.itemFields$ = this.loadContentTypeFormFields();
  }

  /**
   * load FieldConfig for all fields from content type attributes
   */
  private loadContentTypeFormFields = (): Observable<FieldConfig[]> => {
    return this.contentType$
      .pipe(
        switchMap((data: ContentType) => {
          try {
            const parentFieldGroup = this.buildEmptyFieldGroup(null, data.contentType.settings, false, 'Edit Item', true);
            let currentFieldGroup = parentFieldGroup;
            // loop through contentType attributes
            data.contentType.attributes.forEach((attribute, index) => {
              try {
                // if input type is empty-default create new field group and than continue to add fields to that group
                const isEmptyInputType = (attribute.settings.InputType &&
                  attribute.settings.InputType.values[0].value === InputTypesConstants.emptyDefault) ||
                  attribute.type === InputTypesConstants.empty;
                if (isEmptyInputType) { // group-fields (empty)
                  const collapsed = attribute.settings.DefaultCollapsed
                    ? attribute.settings.DefaultCollapsed.values[0].value
                    : false;
                  currentFieldGroup = this.buildEmptyFieldGroup(attribute, null, collapsed, 'Edit Item', false);
                  parentFieldGroup.fieldGroup.push(currentFieldGroup);
                } else { // all other fields (not group empty)
                  const formlyFieldConfig: FieldConfig = this.buildFieldFromDefinition(attribute, index);
                  currentFieldGroup.fieldGroup.push(formlyFieldConfig);
                }
              } catch (error) {
                console.error(`loadContentTypeFormFields(...) - error loading attribut ${index}`, attribute);
                throw error;
              }
            });

            return of([parentFieldGroup]);
          } catch (error) {
            console.error(`Error loading content type: ${error}.
            Content type data: ${JSON.stringify(data)}`, data);
            throw error;
          }
        })
      );
  }

  private buildFieldFromDefinition(attribute: AttributeDef, index: number): FieldConfig {
    try {
      if (attribute.settings.InputType || attribute.type) {
        // if (attribute.settings.InputType.values[0].value.startWith('custom')) {
        //   return this.loadFieldFromDefinition(attribute, InputTypesConstants.external, index);
        // } else {
        //   return this.loadFieldFromDefinition(attribute, attribute.settings.InputType.values[0].value, index);
        // }

        if (attribute.settings.InputType && attribute.settings.InputType.values[0].value) {
          const inputTypeName = this.getInputTypeNameNewConfig(attribute.settings.InputType.values[0].value);
          return this.buildInputTypeFieldConfig(attribute, inputTypeName, index);
        } else {
          const inputTypeFromOldName = this.getInputTypeNameOldConfig(attribute.type);
          return this.buildInputTypeFieldConfig(attribute, inputTypeFromOldName, index);
        }
      } else {
        return this.buildInputTypeFieldConfig(attribute, InputTypesConstants.stringDefault, index);
      }
    } catch (error) {
      console.error(`Error loading input fields: ${error}.
      Attribute name: ${attribute.name}
      Attribute input type: ${attribute.settings.InputType && attribute.settings.InputType.values[0].value
          ? attribute.settings.InputType.values[0].value : attribute.type}`);
      throw error;
    }
  }

  /** read new inputField settings */
  private getInputTypeNameNewConfig(inputTypeName: string): string {
    switch (inputTypeName) {
      case InputTypesConstants.stringDefault:
      case InputTypesConstants.stringUrlPath:
      case InputTypesConstants.booleanDefault:
      case InputTypesConstants.stringDropdown:
      case InputTypesConstants.stringDropdownQuery:
      case InputTypesConstants.datetimeDefault:
      case InputTypesConstants.numberDefault:
      case InputTypesConstants.stringFontIconPicker:
      case InputTypesConstants.entityDefault:
      case InputTypesConstants.entityQuery:
      case InputTypesConstants.entityContentBlocks:
      case InputTypesConstants.hyperlinkDefault:
      case InputTypesConstants.hyperlinkLibrary:
        return inputTypeName;
      case InputTypesConstants.stringWysiwyg:
      case InputTypesConstants.stringWysiwygTinymce:
      case InputTypesConstants.external:
      case 'custom-my-field-test':
        return InputTypesConstants.external;
      default:
        return InputTypesConstants.stringDefault;
    }
  }

  /** read old inputField settings  */
  private getInputTypeNameOldConfig(inputTypeName: string): string {
    switch (inputTypeName) {
      case InputTypesConstants.default:
      case InputTypesConstants.string:
        return InputTypesConstants.stringDefault;
      case InputTypesConstants.stringUrlPath:
        return InputTypesConstants.stringUrlPath;
      case InputTypesConstants.boolean:
        return InputTypesConstants.booleanDefault;
      case InputTypesConstants.dropdown:
        return InputTypesConstants.stringDropdown;
      case InputTypesConstants.datetime:
        return InputTypesConstants.datetimeDefault;
      case InputTypesConstants.number:
        return InputTypesConstants.numberDefault;
      case InputTypesConstants.stringFontIconPicker:
        return InputTypesConstants.stringFontIconPicker;
      case InputTypesConstants.entity:
        return InputTypesConstants.entityDefault;
      case InputTypesConstants.hyperlink:
        return InputTypesConstants.hyperlinkDefault;
      case InputTypesConstants.hyperlinkLibrary:
        return InputTypesConstants.hyperlinkLibrary;
      case InputTypesConstants.external:
      case InputTypesConstants.wysiwyg:
        return InputTypesConstants.external;
      default:
        return InputTypesConstants.stringDefault;
    }
  }

  /**
   * Load inputType FieldConfig from AttributeDef
   */
  private buildInputTypeFieldConfig(attribute: AttributeDef, inputType: string, index: number): FieldConfig {
    const settingsTranslated = LocalizationHelper.translateSettings(attribute.settings, this.currentLanguage, this.defaultLanguage);
    // important - a hidden field dont have validations and is not required
    const visibleInEditUI = (settingsTranslated.VisibleInEditUI === false) ? false : true;
    // set validation for all input types
    const validationList: ValidatorFn[] = visibleInEditUI
      ? ValidationHelper.setDefaultValidations(settingsTranslated)
      : [];
    const required = settingsTranslated.Required && visibleInEditUI
      ? settingsTranslated.Required
      : false;
    let value = LocalizationHelper.translate(
      this.currentLanguage,
      this.defaultLanguage,
      this.item.entity.attributes[attribute.name],
      null
    );
    // set default value if needed
    if (isEmpty(value)) {
      value = this.setDefaultValue(attribute, inputType, settingsTranslated);
      //  defaultValueIsSet = true;
    }
    // this.getFieldDisabled(attribute, settingsTranslated, defaultValueIsSet);
    const disabled: boolean = settingsTranslated.Disabled;
    const label = this.getFieldLabel(attribute, settingsTranslated, null);

    const wrappers = this.setWrappers(inputType, settingsTranslated);

    return {
      disabled: disabled,
      entityId: this.item.entity.id,
      entityGuid: this.item.entity.guid,
      fullSettings: attribute.settings,
      header: this.item.header,
      index: index,
      label: label,
      name: attribute.name,
      placeholder: `Enter ${attribute.name}`, // TODO: need see what to use placeholder or label or both
      required: required,
      settings: settingsTranslated,
      inputType: inputType, // TODO see do we need this
      type: attribute.type,
      validation: validationList,
      value: value,
      wrappers: wrappers, // ['app-hidden-wrapper'],
      features: this.features
    };
  }

  private setWrappers(inputType: string, settingsTranslated: EavAttributesTranslated) {
    // default wrappers
    const wrappers: string[] = ['app-hidden-wrapper'];

    // entity-default wrappers
    if (inputType === InputTypesConstants.entityDefault ||
      inputType === InputTypesConstants.stringDropdownQuery ||
      inputType === InputTypesConstants.entityQuery ||
      inputType === InputTypesConstants.entityContentBlocks) {
      const allowMultiValue = settingsTranslated.AllowMultiValue || false;

      if (allowMultiValue ||
        inputType === InputTypesConstants.entityContentBlocks) {
        wrappers.push('app-entity-expandable-wrapper');
      }
    }

    return wrappers;
  }

  /**
   * Create fieldConfig for title field group with collapsible wrapper
   */
  private buildEmptyFieldGroup = (
    attribute: AttributeDef,
    contentTypeSettings: EavAttributes,
    collapse: boolean,
    defaultValue: string,
    isParentGroup: boolean
  ): FieldConfig => {
    let settingsTranslated = null;
    let fullSettings = null;

    if (attribute) {
      settingsTranslated = LocalizationHelper.translateSettings(attribute.settings, this.currentLanguage, this.defaultLanguage);
      fullSettings = attribute.settings;
    } else if (contentTypeSettings) {
      settingsTranslated = LocalizationHelper.translateSettings(contentTypeSettings, this.currentLanguage, this.defaultLanguage);
      fullSettings = contentTypeSettings;
    }

    const label = this.getFieldLabel(attribute, settingsTranslated, defaultValue);
    const name = attribute !== null ? attribute.name : defaultValue;

    return {
      entityId: this.item.entity.id,
      entityGuid: this.item.entity.guid,
      fullSettings: fullSettings,
      collapse: collapse,
      fieldGroup: [],
      header: this.item.header,
      label: label,
      name: name,
      settings: settingsTranslated,
      inputType: InputTypesConstants.emptyDefault,
      isParentGroup: isParentGroup,
      //  type: attribute.type,
      wrappers: ['app-collapsible-wrapper'],
    };
  }

  private getFieldLabel = (attribute: AttributeDef, settingsTranslated: EavAttributesTranslated, defaultValue: any): string => {
    return attribute !== null
      ? (settingsTranslated !== null && settingsTranslated.Name)
        ? settingsTranslated.Name
        : attribute.name
      : defaultValue;
  }

  // private getFieldDisabled = (
  //   attribute: AttributeDef,
  //   settingsTranslated: EavAttributesTranslated,
  //   defaultValueIsSet: boolean
  // ): boolean => {

  //   return settingsTranslated.Disabled
  //     ? true
  //   : this.item.entity.id === 0 || defaultValueIsSet
  //     ? false
  //   : !LocalizationHelper.isEditableTranslationExist(
  //     this.item.entity.attributes[attribute.name],
  //     this.currentLanguage,
  //     this.defaultLanguage
  //   );
  // }

  /** Set default value and add that attribute in store */
  private setDefaultValue(attribute: AttributeDef, inputType: string, settingsTranslated: EavAttributesTranslated): any {
    const defaultValue = this.parseDefaultValue(attribute.name, inputType, settingsTranslated, this.item.header);

    this.itemService.addAttributeValue(
      this.item.entity.id,
      attribute.name,
      defaultValue,
      this.currentLanguage,
      false,
      this.item.entity.guid,
      attribute.type);
    return defaultValue;
  }

  private parseDefaultValue(attributeKey: string, inputType: string, settings: EavAttributesTranslated, header: EavHeader): any {
    let defaultValue = settings.DefaultValue;

    if (header.prefill && header.prefill[attributeKey]) {
      defaultValue = header.prefill[attributeKey];
    }

    switch (inputType) {
      case InputTypesConstants.booleanDefault:
        return defaultValue !== undefined && defaultValue !== null
          ? defaultValue.toLowerCase() === 'true'
          : false;
      case InputTypesConstants.datetimeDefault:
        return defaultValue !== undefined && defaultValue !== null && defaultValue !== ''
          ? new Date(defaultValue)
          : null;
      case InputTypesConstants.numberDefault:
        return defaultValue !== undefined && defaultValue !== null && defaultValue !== ''
          ? Number(defaultValue)
          : '';
      case InputTypesConstants.entityDefault:
      case InputTypesConstants.entityQuery:
        if (!(defaultValue !== undefined && defaultValue !== null && defaultValue !== '')) {
          return []; // no default value
        }
        // 3 possibilities
        if (defaultValue.constructor === Array) { return defaultValue; }  // possibility 1) an array

        // for possibility 2 & 3, do some variation checking
        if (defaultValue.indexOf('{') > -1) { // string has { } characters, we must switch them to quotes
          defaultValue = defaultValue.replace(/[\{\}]/g, '\"');
        }

        if (defaultValue.indexOf(',') !== -1 && defaultValue.indexOf('[') === -1) { // list but no array, add brackets
          defaultValue = '[' + defaultValue + ']';
        }

        return (defaultValue.indexOf('[') === 0) // possibility 2) an array with guid strings
          ? JSON.parse(defaultValue) // if it's a string containing an array
          : [defaultValue.replace(/"/g, '')]; //  possibility 3) just a guid string, but might have quotes

      default:
        return defaultValue ? defaultValue : '';
    }
  }
}
