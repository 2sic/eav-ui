import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { InputTypeConstants } from '../../../ng-dialogs/src/app/content-type-fields/constants/input-type.constants';
import { FieldConfigSet } from '../../eav-dynamic-form/model/field-config';
import { InputFieldHelper } from '../../shared/helpers/input-field-helper';
import { CalculatedInputType } from '../../shared/models';
import { EavContentType, EavContentTypeAttribute, EavItem } from '../../shared/models/eav';
import { ContentTypeService } from '../../shared/store/ngrx-data/content-type.service';
import { InputTypeService } from '../../shared/store/ngrx-data/input-type.service';
import { ItemService } from '../../shared/store/ngrx-data/item.service';
import { LanguageInstanceService } from '../../shared/store/ngrx-data/language-instance.service';
import { FieldHelper } from './field-helper';

@Injectable()
export class BuildFieldsService {
  private item: EavItem;
  private formId: number;

  constructor(
    private itemService: ItemService,
    private inputTypeService: InputTypeService,
    private languageInstanceService: LanguageInstanceService,
    private contentTypeService: ContentTypeService,
  ) { }

  public buildFieldConfigs(contentType: EavContentType, item: EavItem, formId: number): FieldConfigSet[] {
    this.item = item;
    this.formId = formId;

    // build first empty
    const parentType: CalculatedInputType = {
      inputType: InputTypeConstants.EmptyDefault,
      isExternal: false,
    };
    const parentFieldGroup = this.buildFieldConfig(null, parentType);
    let currentFieldGroup = parentFieldGroup;

    // loop through contentType attributes
    contentType.Attributes.forEach((attribute, index) => {
      try {
        // if input type is empty-default create new field group and than continue to add fields to that group
        const calculatedInputType: CalculatedInputType = InputFieldHelper.calculateInputType(attribute, this.inputTypeService);
        const isEmptyInputType = (calculatedInputType.inputType === InputTypeConstants.EmptyDefault);
        if (isEmptyInputType) {
          // group-fields (empty)
          currentFieldGroup = this.buildFieldConfig(attribute, calculatedInputType);
          parentFieldGroup._fieldGroup.push(currentFieldGroup);
        } else {
          // all other fields (not group empty)
          const fieldConfigSet = this.buildFieldConfig(attribute, calculatedInputType);
          currentFieldGroup._fieldGroup.push(fieldConfigSet);
        }
      } catch (error) {
        console.error(`loadContentTypeFormFields(...) - error loading attribut ${index}`, attribute);
        throw error;
      }
    });
    return parentFieldGroup._fieldGroup;
  }

  private buildFieldConfig(attribute: EavContentTypeAttribute, calculatedInputType: CalculatedInputType): FieldConfigSet {
    const isEmptyInputType = (calculatedInputType.inputType === InputTypeConstants.EmptyDefault);
    const name = attribute ? attribute.Name : 'Edit Item';
    if (isEmptyInputType) {
      const fieldConfigSet: FieldConfigSet = {
        name,
        _fieldGroup: [],
      };
      return fieldConfigSet;
    } else {
      const contentTypeId = InputFieldHelper.getContentTypeId(this.item);
      const fieldHelper = new FieldHelper(
        attribute.Name,
        this.item.Entity.Guid,
        this.formId,
        contentTypeId,
        this.itemService,
        this.languageInstanceService,
        this.contentTypeService,
        this.inputTypeService,
      );
      const fieldConfigSet: FieldConfigSet = {
        name,
        fieldHelper,
        focused$: new BehaviorSubject(false),
      };
      return fieldConfigSet;
    }
  }

  public startTranslations(fieldConfigs: FieldConfigSet[]): void {
    for (const config of fieldConfigs) {
      if (config._fieldGroup) {
        this.startTranslations(config._fieldGroup);
      } else {
        config.fieldHelper?.startTranslations();
      }
    }
  }

  public stopTranslations(fieldConfigs: FieldConfigSet[]): void {
    for (const config of fieldConfigs) {
      if (config._fieldGroup) {
        this.stopTranslations(config._fieldGroup);
      } else {
        config.fieldHelper?.stopTranslations();
      }
    }
  }
}
