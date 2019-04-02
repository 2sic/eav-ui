import { Observable } from 'rxjs/Observable';
import { switchMap } from 'rxjs/operators';
import { of } from 'rxjs';
import { ValidatorFn } from '@angular/forms';
import isEmpty from 'lodash/isEmpty';

import { AttributeDef } from '../../../shared/models/eav/attribute-def';
import { EavAttributes, EavAttributesTranslated, ContentType, Item } from '../../../shared/models/eav';
import { FieldConfigSet, ItemConfig, FormConfig, FieldConfigAngular, FieldConfigGroup } from '../../../eav-dynamic-form/model/field-config';
import { InputTypesConstants } from '../../../shared/constants';
import { LocalizationHelper } from '../../../shared/helpers/localization-helper';
import { InputFieldHelper } from '../../../shared/helpers/input-field-helper';
import { ValidationHelper } from '../../../eav-material-controls/validators/validation-helper';
import { ItemService } from '../../../shared/services/item.service';
import { Injectable } from '@angular/core';
import { Feature } from '../../../shared/models/feature/feature';

@Injectable({
  providedIn: 'root'
})
export class BuildFieldsService {
  private contentType$: Observable<ContentType>;
  private item: Item;
  private features: Feature[];
  private currentLanguage: string;
  private defaultLanguage: string;

  constructor(private itemService: ItemService) { }

  public buildFields(
    contentType$: Observable<ContentType>,
    item: Item,
    features: Feature[],
    currentLanguage: string,
    defaultLanguage: string,
  ): Observable<FieldConfigSet[]> {
    this.contentType$ = contentType$;
    this.item = item;
    this.features = features;
    this.currentLanguage = currentLanguage;
    this.defaultLanguage = defaultLanguage;

    return this.contentType$
      .pipe(
        switchMap((data: ContentType) => {
          const allInputTypeNames: string[] = InputFieldHelper.getInputTypeNamesFromAttributes(data.contentType.attributes);
          // build first empty
          const parentFieldGroup: FieldConfigSet = this.buildFieldConfigSet(null, null, allInputTypeNames,
            InputTypesConstants.emptyDefault, data.contentType.settings, true);
          let currentFieldGroup: FieldConfigSet = parentFieldGroup;

          // loop through contentType attributes
          data.contentType.attributes.forEach((attribute, index) => {
            try {
              // if input type is empty-default create new field group and than continue to add fields to that group
              const inputTypeName: string = InputFieldHelper.getInputTypeNameFromAttribute(attribute);
              const isEmptyInputType = (inputTypeName === InputTypesConstants.emptyDefault) ||
                (inputTypeName === InputTypesConstants.empty);
              if (isEmptyInputType) {
                // group-fields (empty)
                currentFieldGroup = this.buildFieldConfigSet(attribute, index, allInputTypeNames, inputTypeName,
                  data.contentType.settings, false);
                const field = parentFieldGroup.field as FieldConfigGroup;
                field.fieldGroup.push(currentFieldGroup);
              } else {
                // all other fields (not group empty)
                const fieldConfigSet = this.buildFieldConfigSet(attribute, index, allInputTypeNames, inputTypeName,
                  data.contentType.settings, null);
                const field = currentFieldGroup.field as FieldConfigGroup;
                field.fieldGroup.push(fieldConfigSet);
              }
            } catch (error) {
              console.error(`loadContentTypeFormFields(...) - error loading attribut ${index}`, attribute);
              throw error;
            }
          });

          return of([parentFieldGroup]);
        })
      );
  }

  private buildFieldConfigSet(attribute: AttributeDef, index: number, allInputTypeNames: string[], inputType: string,
    contentTypeSettings: EavAttributes, isParentGroup: boolean): FieldConfigSet {
    const entity: ItemConfig = {
      entityId: this.item.entity.id,
      entityGuid: this.item.entity.guid,
      header: this.item.header,
    };
    const form: FormConfig = {
      allInputTypeNames: allInputTypeNames,
      features: this.features,
    };
    const field = this.buildFieldConfig(attribute, index, inputType, contentTypeSettings, isParentGroup);

    const fieldConfigSet: FieldConfigSet = { field, entity, form };
    return fieldConfigSet;
  }

  private buildFieldConfig(attribute: AttributeDef, index: number, inputType: string, contentTypeSettings: EavAttributes,
    isParentGroup: boolean): FieldConfigAngular {
    let fieldConfig: FieldConfigAngular;
    let settingsTranslated: EavAttributesTranslated;
    let fullSettings: EavAttributes;
    const isEmptyInputType = (inputType === InputTypesConstants.emptyDefault)
      || (inputType === InputTypesConstants.empty);

    if (attribute) {
      settingsTranslated = LocalizationHelper.translateSettings(attribute.settings, this.currentLanguage, this.defaultLanguage);
      fullSettings = attribute.settings;
    } else if (isEmptyInputType && contentTypeSettings) {
      settingsTranslated = LocalizationHelper.translateSettings(contentTypeSettings, this.currentLanguage, this.defaultLanguage);
      fullSettings = contentTypeSettings;
    }

    const name: string = attribute ? attribute.name : 'Edit Item';
    const label: string = InputFieldHelper.getFieldLabel(attribute, settingsTranslated) || 'Edit Item';
    const wrappers: string[] = InputFieldHelper.setWrappers(inputType, settingsTranslated);

    if (isEmptyInputType) {
      fieldConfig = {
        isParentGroup: isParentGroup, // empty specific
        fieldGroup: [], // empty specific
        settings: settingsTranslated,
        fullSettings: fullSettings,
        wrappers: wrappers,
        name: name,
        label: label,
        inputType: inputType,
      } as FieldConfigGroup;
    } else {
      const validationList: ValidatorFn[] = ValidationHelper.getValidations(settingsTranslated);
      const required: boolean = ValidationHelper.isRequired(settingsTranslated);
      let initialValue = LocalizationHelper.translate(
        this.currentLanguage,
        this.defaultLanguage,
        this.item.entity.attributes[name],
        null
      );
      // set default value if needed
      if (isEmpty(initialValue) && typeof initialValue !== typeof true && typeof initialValue !== typeof 1) {
        initialValue = this.itemService.setDefaultValue(this.item, attribute, inputType, settingsTranslated,
          this.currentLanguage, this.defaultLanguage);
      }
      const disabled: boolean = settingsTranslated.Disabled;

      fieldConfig = {
        initialValue: initialValue, // other fields specific
        validation: validationList, // other fields specific
        settings: settingsTranslated,
        fullSettings: fullSettings,
        wrappers: wrappers,
        name: name,
        index: index, // other fields specific
        label: label,
        placeholder: `Enter ${name}`,  // other fields specific
        inputType: inputType,
        type: attribute.type, // other fields specific
        required: required, // other fields specific
        disabled: disabled, // other fields specific
      };
    }
    return fieldConfig;
  }
}
