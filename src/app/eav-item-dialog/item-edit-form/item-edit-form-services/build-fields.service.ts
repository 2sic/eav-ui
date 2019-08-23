import { Injectable } from '@angular/core';
import { ValidatorFn } from '@angular/forms';
import { of, BehaviorSubject } from 'rxjs';
import { Observable } from 'rxjs';
import { switchMap, take } from 'rxjs/operators';
import isEmpty from 'lodash/isEmpty';

import { AttributeDef } from '../../../shared/models/eav/attribute-def';
import { EavAttributes, FieldSettings, ContentType, Item } from '../../../shared/models/eav';
import { FieldConfigSet, ItemConfig, FormConfig, FieldConfigAngular, FieldConfigGroup } from '../../../eav-dynamic-form/model/field-config';
import { InputTypesConstants } from '../../../shared/constants';
import { LocalizationHelper } from '../../../shared/helpers/localization-helper';
import { InputFieldHelper } from '../../../shared/helpers/input-field-helper';
import { ValidationHelper } from '../../../eav-material-controls/validators/validation-helper';
import { ItemService } from '../../../shared/services/item.service';
import { CalculatedInputType } from '../../../shared/models/input-field-models';
import { InputTypeService } from '../../../shared/store/ngrx-data/input-type.service';

@Injectable({ providedIn: 'root' })
export class BuildFieldsService {
  private contentType$: Observable<ContentType>;
  private item: Item;
  private formId: string;
  private currentLanguage: string;
  private defaultLanguage: string;

  constructor(
    private itemService: ItemService,
    private inputTypeService: InputTypeService,
  ) { }

  public buildFields(
    contentType$: Observable<ContentType>,
    item: Item,
    formId: string,
    currentLanguage: string,
    defaultLanguage: string,
  ): Observable<FieldConfigSet[]> {
    this.contentType$ = contentType$;
    this.item = item;
    this.formId = formId;
    this.currentLanguage = currentLanguage;
    this.defaultLanguage = defaultLanguage;

    return this.contentType$
      .pipe(
        switchMap((data: ContentType) => {
          // build first empty
          const parentFieldGroup: FieldConfigSet = this.buildFieldConfigSet(null, null,
            { inputType: InputTypesConstants.emptyDefault, isExternal: false },
            data.contentType.settings, true);
          let currentFieldGroup: FieldConfigSet = parentFieldGroup;

          // loop through contentType attributes
          data.contentType.attributes.forEach((attribute, index) => {
            try {
              // if input type is empty-default create new field group and than continue to add fields to that group
              const calculatedInputType: CalculatedInputType = InputFieldHelper.getInputTypeNameFromAttribute(attribute);
              const isEmptyInputType = (calculatedInputType.inputType === InputTypesConstants.emptyDefault);
              if (isEmptyInputType) {
                // group-fields (empty)
                currentFieldGroup = this.buildFieldConfigSet(attribute, index, calculatedInputType,
                  data.contentType.settings, false);
                const field = parentFieldGroup.field as FieldConfigGroup;
                field.fieldGroup.push(currentFieldGroup);
              } else {
                // all other fields (not group empty)
                const fieldConfigSet = this.buildFieldConfigSet(attribute, index, calculatedInputType,
                  data.contentType.settings, null);
                const field = currentFieldGroup.field as FieldConfigGroup;
                field.fieldGroup.push(fieldConfigSet);
              }
            } catch (error) {
              console.error(`loadContentTypeFormFields(...) - error loading attribut ${index}`, attribute);
              throw error;
            }
          });
          try {
            this.calculateFieldPositionInGroup(parentFieldGroup.field as FieldConfigGroup);
          } catch (error) {
            console.error(`Error calculating last field in each group: ${error}`);
          }
          return of([parentFieldGroup]);
        })
      );
  }

  private calculateFieldPositionInGroup(field: FieldConfigGroup) {
    if (!field.fieldGroup) { return; }

    const childFieldSetsCount = field.fieldGroup.length;
    if (childFieldSetsCount === 0) { return; }

    const lastChildFieldSet = field.fieldGroup[childFieldSetsCount - 1];
    if (lastChildFieldSet.field.inputType !== InputTypesConstants.emptyDefault) {
      lastChildFieldSet.field.isLastInGroup = true;
    }

    field.fieldGroup.forEach(childFieldSet => {
      this.calculateFieldPositionInGroup(childFieldSet.field as FieldConfigGroup);
    });
  }

  private buildFieldConfigSet(attribute: AttributeDef, index: number, calculatedInputType: CalculatedInputType,
    contentTypeSettings: EavAttributes, isParentGroup: boolean): FieldConfigSet {
    const entity: ItemConfig = {
      entityId: this.item.entity.id,
      entityGuid: this.item.entity.guid,
      contentTypeId: InputFieldHelper.getContentTypeId(this.item),
      header: this.item.header,
    };
    const form: FormConfig = {
      formId: this.formId,
    };
    const field = this.buildFieldConfig(attribute, index, calculatedInputType, contentTypeSettings, isParentGroup);

    const fieldConfigSet: FieldConfigSet = { field, entity, form };
    return fieldConfigSet;
  }

  private buildFieldConfig(attribute: AttributeDef, index: number, calculatedInputType: CalculatedInputType,
    contentTypeSettings: EavAttributes, isParentGroup: boolean): FieldConfigAngular {
    let fieldConfig: FieldConfigAngular;
    let settingsTranslated: FieldSettings;
    let fullSettings: EavAttributes;
    const isEmptyInputType = (calculatedInputType.inputType === InputTypesConstants.emptyDefault);

    if (attribute) {
      settingsTranslated = LocalizationHelper.translateSettings(attribute.settings, this.currentLanguage, this.defaultLanguage);
      fullSettings = attribute.settings;
    } else if (isEmptyInputType && contentTypeSettings) {
      settingsTranslated = LocalizationHelper.translateSettings(contentTypeSettings, this.currentLanguage, this.defaultLanguage);
      fullSettings = contentTypeSettings;
    }

    // these settings are recalculated in translate-group-menu translateAllConfiguration
    const name: string = attribute ? attribute.name : 'Edit Item';
    const label: string = attribute ? InputFieldHelper.getFieldLabel(attribute, settingsTranslated) : 'Edit Item';
    const wrappers: string[] = InputFieldHelper.setWrappers(calculatedInputType, settingsTranslated);
    let disableI18n = false;
    this.inputTypeService.getInputTypeById(calculatedInputType.inputType).pipe(take(1)).subscribe(type => {
      if (type) { disableI18n = type.DisableI18n; }
    });
    const isLastInGroup = false; // calculated later in calculateFieldPositionInGroup

    if (isEmptyInputType) {
      fieldConfig = {
        isParentGroup: isParentGroup, // empty specific
        fieldGroup: [], // empty specific
        settings: settingsTranslated,
        fullSettings: fullSettings,
        wrappers: wrappers,
        isExternal: calculatedInputType.isExternal,
        disableI18n: disableI18n,
        isLastInGroup: isLastInGroup,
        name: name,
        label: label,
        inputType: calculatedInputType.inputType,
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
      if (isEmpty(initialValue) && typeof initialValue !== typeof true && typeof initialValue !== typeof 1 && initialValue !== '') {
        initialValue = this.itemService.setDefaultValue(this.item, attribute, calculatedInputType.inputType, settingsTranslated,
          this.currentLanguage, this.defaultLanguage);
      }
      const disabled: boolean = settingsTranslated.Disabled;

      fieldConfig = {
        initialValue: initialValue, // other fields specific
        validation: validationList, // other fields specific
        settings: settingsTranslated,
        fullSettings: fullSettings,
        wrappers: wrappers,
        expanded: new BehaviorSubject(false),
        isExternal: calculatedInputType.isExternal,
        disableI18n: disableI18n,
        isLastInGroup: isLastInGroup,
        name: name,
        index: index, // other fields specific
        label: label,
        placeholder: `Enter ${name}`,  // other fields specific
        inputType: calculatedInputType.inputType,
        type: attribute.type, // other fields specific
        required: required, // other fields specific
        disabled: disabled, // other fields specific
      };
    }
    return fieldConfig;
  }
}
