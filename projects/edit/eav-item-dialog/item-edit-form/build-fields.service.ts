import { Injectable } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { EavService } from '../..';
import { InputTypeConstants } from '../../../ng-dialogs/src/app/content-type-fields/constants/input-type.constants';
import { FieldConfigGroup, FieldConfigSet, FormConfig, ItemConfig } from '../../eav-dynamic-form/model/field-config';
import { InputFieldHelper } from '../../shared/helpers/input-field-helper';
import { CalculatedInputType } from '../../shared/models';
import { EavAttributes, EavContentType, EavContentTypeAttribute, EavItem } from '../../shared/models/eav';
import { FieldsSettingsService } from '../../shared/services/fields-settings.service';
import { FormulaInstanceService } from '../../shared/services/formula-instance.service';
import { ContentTypeService } from '../../shared/store/ngrx-data/content-type.service';
import { InputTypeService } from '../../shared/store/ngrx-data/input-type.service';
import { ItemService } from '../../shared/store/ngrx-data/item.service';
import { LanguageInstanceService } from '../../shared/store/ngrx-data/language-instance.service';

@Injectable()
export class BuildFieldsService {
  private item: EavItem;
  private formId: number;
  private currentLanguage: string;
  private defaultLanguage: string;
  private enableHistory: boolean;
  private fieldsSettingsService: FieldsSettingsService;

  constructor(
    private itemService: ItemService,
    private inputTypeService: InputTypeService,
    private languageInstanceService: LanguageInstanceService,
    private contentTypeService: ContentTypeService,
    private eavService: EavService,
  ) { }

  public buildFieldConfigs(
    contentType: EavContentType,
    item: EavItem,
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

    const contentTypeSettings = contentType.Settings;
    const entity: ItemConfig = {
      entityId: this.item.Entity.Id,
      entityGuid: this.item.Entity.Guid,
      contentTypeId: InputFieldHelper.getContentTypeId(this.item),
      header: this.item.Header,
    };
    const form: FormConfig = {
      formId: this.formId,
      enableHistory: this.enableHistory,
    };

    // build first empty
    const parentType: CalculatedInputType = {
      inputType: InputTypeConstants.EmptyDefault,
      isExternal: false,
    };
    const parentFieldGroup = this.buildFieldConfig(null, null, parentType, contentTypeSettings, true, entity, form);
    let currentFieldGroup = parentFieldGroup;

    // loop through contentType attributes
    contentType.Attributes.forEach((attribute, index) => {
      try {
        // if input type is empty-default create new field group and than continue to add fields to that group
        const calculatedInputType: CalculatedInputType = InputFieldHelper.calculateInputType(attribute, this.inputTypeService);
        const isEmptyInputType = (calculatedInputType.inputType === InputTypeConstants.EmptyDefault);
        if (isEmptyInputType) {
          // group-fields (empty)
          currentFieldGroup = this.buildFieldConfig(attribute, index, calculatedInputType, contentTypeSettings, false, entity, form);
          const field = parentFieldGroup.field as FieldConfigGroup;
          field.fieldGroup.push(currentFieldGroup);
        } else {
          // all other fields (not group empty)
          const fieldConfigSet = this.buildFieldConfig(attribute, index, calculatedInputType, contentTypeSettings, null, entity, form);
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

  private buildFieldConfig(
    attribute: EavContentTypeAttribute,
    index: number,
    calculatedInputType: CalculatedInputType,
    contentTypeSettings: EavAttributes,
    isParentGroup: boolean,
    entity: ItemConfig,
    form: FormConfig,
  ): FieldConfigSet {
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
      this.itemService,
      this.formId,
      this.languageInstanceService,
      this.contentTypeService,
      this.eavService,
    );

    const fieldConfigSet: FieldConfigSet = {
      field,
      entity,
      form,
    };
    return fieldConfigSet;
  }

  private calculateFieldPositionInGroup(fieldConfig: FieldConfigGroup): void {
    if (!fieldConfig.fieldGroup) { return; }

    const childFieldsCount = fieldConfig.fieldGroup.length;
    if (childFieldsCount === 0) { return; }

    const lastChildConfig = fieldConfig.fieldGroup[childFieldsCount - 1];
    if (lastChildConfig.field.inputType !== InputTypeConstants.EmptyDefault) {
      lastChildConfig.field.isLastInGroup = true;
    }

    fieldConfig.fieldGroup.forEach(childFieldConfig => {
      this.calculateFieldPositionInGroup(childFieldConfig.field as FieldConfigGroup);
    });
  }

  public startTranslations(
    fieldConfigs: FieldConfigSet[],
    form: FormGroup,
    formulaInstance: FormulaInstanceService,
    fieldsSettingsService: FieldsSettingsService,
  ): void {
    for (const config of fieldConfigs) {
      const field = config.field as FieldConfigGroup;
      if (field.fieldGroup) {
        this.startTranslations(field.fieldGroup, form, formulaInstance, fieldsSettingsService);
      } else {
        config.field.fieldHelper?.startTranslations(config, form, formulaInstance, fieldsSettingsService);
      }
    }
  }

  public stopTranslations(fieldConfigs: FieldConfigSet[]): void {
    for (const config of fieldConfigs) {
      const field = config.field as FieldConfigGroup;
      if (field.fieldGroup) {
        this.stopTranslations(field.fieldGroup);
      } else {
        config.field.fieldHelper?.stopTranslations();
      }
    }
  }
}
