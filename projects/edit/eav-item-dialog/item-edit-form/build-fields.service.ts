import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { InputTypeConstants } from '../../../ng-dialogs/src/app/content-type-fields/constants/input-type.constants';
import { FieldConfigSet } from '../../eav-dynamic-form/model/field-config';
import { InputFieldHelper } from '../../shared/helpers/input-field-helper';
import { CalculatedInputType } from '../../shared/models';
import { EavContentType, EavContentTypeAttribute } from '../../shared/models/eav';
import { InputTypeService } from '../../shared/store/ngrx-data/input-type.service';

@Injectable()
export class BuildFieldsService {
  constructor(private inputTypeService: InputTypeService) { }

  public buildFieldConfigs(contentType: EavContentType): FieldConfigSet[] {
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
      const fieldConfigSet: FieldConfigSet = {
        name,
        focused$: new BehaviorSubject(false),
      };
      return fieldConfigSet;
    }
  }
}
