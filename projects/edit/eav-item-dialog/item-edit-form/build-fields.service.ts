import { Injectable } from '@angular/core';
import { InputTypeConstants } from '../../../ng-dialogs/src/app/content-type-fields/constants/input-type.constants';
import { FieldConfigGroup, FieldConfigSet, FormConfig, ItemConfig } from '../../eav-dynamic-form/model/field-config';
import { InputFieldHelper } from '../../shared/helpers/input-field-helper';
import { ContentType, EavAttributes, Item } from '../../shared/models/eav';
import { AttributeDef } from '../../shared/models/eav/attribute-def';
import { CalculatedInputType } from '../../shared/models/input-field-models';
import { FieldsSettingsService } from '../../shared/services/fields-settings.service';
import { InputTypeService } from '../../shared/store/ngrx-data/input-type.service';
import { ItemService } from '../../shared/store/ngrx-data/item.service';
import { LanguageService } from '../../shared/store/ngrx-data/language.service';

@Injectable()
export class BuildFieldsService {
  private item: Item;
  private formId: number;
  private currentLanguage: string;
  private defaultLanguage: string;
  private enableHistory: boolean;
  private fieldsSettingsService: FieldsSettingsService;

  constructor(
    private itemService: ItemService,
    private inputTypeService: InputTypeService,
    private languageService: LanguageService,
  ) { }

  public buildFields(
    contentType: ContentType,
    item: Item,
    formId: number,
    currentLanguage: string,
    defaultLanguage: string,
    enableHistory: boolean,
    fieldsSettingsService: FieldsSettingsService,
  ): FieldConfigSet[] {
    this.item = item;
    this.formId = formId;
    this.currentLanguage = currentLanguage;
    this.defaultLanguage = defaultLanguage;
    this.enableHistory = enableHistory;
    this.fieldsSettingsService = fieldsSettingsService;

    // build first empty
    const parentType: CalculatedInputType = {
      inputType: InputTypeConstants.EmptyDefault,
      isExternal: false
    };
    const parentFieldGroup: FieldConfigSet = this.buildFieldConfigSet(null, null, parentType, contentType.contentType.settings, true);
    let currentFieldGroup: FieldConfigSet = parentFieldGroup;

    // loop through contentType attributes
    contentType.contentType.attributes.forEach((attribute, index) => {
      try {
        // if input type is empty-default create new field group and than continue to add fields to that group
        const calculatedInputType: CalculatedInputType = InputFieldHelper.calculateInputType(attribute, this.inputTypeService);
        const isEmptyInputType = (calculatedInputType.inputType === InputTypeConstants.EmptyDefault);
        if (isEmptyInputType) {
          // group-fields (empty)
          currentFieldGroup = this.buildFieldConfigSet(attribute, index, calculatedInputType, contentType.contentType.settings, false);
          const field = parentFieldGroup.field as FieldConfigGroup;
          field.fieldGroup.push(currentFieldGroup);
        } else {
          // all other fields (not group empty)
          const fieldConfigSet = this.buildFieldConfigSet(attribute, index, calculatedInputType, contentType.contentType.settings, null);
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
    return [parentFieldGroup];
  }

  private buildFieldConfigSet(
    attribute: AttributeDef,
    index: number,
    calculatedInputType: CalculatedInputType,
    contentTypeSettings: EavAttributes,
    isParentGroup: boolean,
  ): FieldConfigSet {
    const entity: ItemConfig = {
      entityId: this.item.entity.id,
      entityGuid: this.item.entity.guid,
      contentTypeId: InputFieldHelper.getContentTypeId(this.item),
      header: this.item.header,
    };
    const form: FormConfig = {
      formId: this.formId,
      enableHistory: this.enableHistory,
    };
    const field = this.fieldsSettingsService.buildFieldConfig(
      attribute,
      index,
      calculatedInputType,
      contentTypeSettings,
      isParentGroup,
      this.currentLanguage,
      this.defaultLanguage,
      this.item,
      this.inputTypeService,
      this.languageService,
      this.itemService,
    );

    const fieldConfigSet: FieldConfigSet = {
      field,
      entity,
      form,
    };
    return fieldConfigSet;
  }

  private calculateFieldPositionInGroup(field: FieldConfigGroup) {
    if (!field.fieldGroup) { return; }

    const childFieldSetsCount = field.fieldGroup.length;
    if (childFieldSetsCount === 0) { return; }

    const lastChildFieldSet = field.fieldGroup[childFieldSetsCount - 1];
    if (lastChildFieldSet.field.inputType !== InputTypeConstants.EmptyDefault) {
      lastChildFieldSet.field.isLastInGroup = true;
    }

    field.fieldGroup.forEach(childFieldSet => {
      this.calculateFieldPositionInGroup(childFieldSet.field as FieldConfigGroup);
    });
  }
}
