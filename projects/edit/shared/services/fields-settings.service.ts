import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { InputTypeConstants } from '../../../ng-dialogs/src/app/content-type-fields/constants/input-type.constants';
import { FieldConfigAngular } from '../../eav-dynamic-form/model/field-config';
import { FieldHelper } from '../../eav-item-dialog/item-edit-form/field-helper';
import { InputFieldHelper } from '../helpers/input-field-helper';
import { CalculatedInputType } from '../models';
import { EavContentTypeAttribute, EavItem } from '../models/eav';
import { ContentTypeService } from '../store/ngrx-data/content-type.service';
import { InputTypeService } from '../store/ngrx-data/input-type.service';
import { ItemService } from '../store/ngrx-data/item.service';
import { LanguageInstanceService } from '../store/ngrx-data/language-instance.service';

@Injectable()
export class FieldsSettingsService {

  constructor() { }

  public buildFieldConfig(
    attribute: EavContentTypeAttribute,
    calculatedInputType: CalculatedInputType,
    item: EavItem,
    inputTypeService: InputTypeService,
    itemService: ItemService,
    formId: number,
    languageInstanceService: LanguageInstanceService,
    contentTypeService: ContentTypeService,
  ): FieldConfigAngular {
    let fieldConfig: FieldConfigAngular;
    const isEmptyInputType = (calculatedInputType.inputType === InputTypeConstants.EmptyDefault);

    const name = attribute ? attribute.Name : 'Edit Item';
    const contentTypeId = InputFieldHelper.getContentTypeId(item);
    const fieldHelper = new FieldHelper(
      name,
      item.Entity.Guid,
      formId,
      contentTypeId,
      itemService,
      languageInstanceService,
      contentTypeService,
      inputTypeService,
    );

    if (isEmptyInputType) {
      fieldConfig = {
        _fieldGroup: [], // empty specific
        name,
      } as FieldConfigAngular;
    } else {
      fieldConfig = {
        _fieldGroup: null,
        focused$: new BehaviorSubject(false),
        name,
        fieldHelper,
      };
    }
    return fieldConfig;
  }
}
