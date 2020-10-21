import { take } from 'rxjs/operators';
import { FieldConfigGroup, FieldConfigSet } from '../../eav-dynamic-form/model/field-config';
import { EavEntity } from '../../shared/models/eav';
import { ContentTypeItemService } from '../../shared/store/ngrx-data/content-type-item.service';
import { FieldCalculations } from './item-edit-form.models';

interface CalculationFields {
  [key: string]: string[];
}

export function findFieldCalculations(fieldConfigArray: FieldConfigSet[], contentTypeItemService: ContentTypeItemService) {
  const calcFields: CalculationFields = {};
  findCalculationFields(calcFields, fieldConfigArray);
  const fieldCalculations = findCalculations(calcFields, contentTypeItemService);
  return fieldCalculations;
}

function findCalculationFields(calcFields: CalculationFields, fieldConfigArray: FieldConfigSet[]) {
  fieldConfigArray.forEach(fieldConfig => {
    const fieldConfigGroup = fieldConfig.field as FieldConfigGroup;
    if (fieldConfigGroup.fieldGroup != null) {
      findCalculationFields(calcFields, fieldConfigGroup.fieldGroup);
    } else {
      const calculations = fieldConfig.field.settings$.value.Calculations;
      if (calculations == null || !calculations.length) { return; }
      calcFields[fieldConfig.field.name] = calculations;
    }
  });
}

function findCalculations(calcFields: CalculationFields, contentTypeItemService: ContentTypeItemService) {
  const fieldCalculations: FieldCalculations = {};
  Object.entries(calcFields).forEach(([fieldName, calcItemGuids]) => {
    const calcItems: EavEntity[] = [];
    calcItemGuids.forEach(calcItemGuid => {
      contentTypeItemService.getContentTypeItemByGuid(calcItemGuid).pipe(take(1)).subscribe(calcItem => {
        calcItems.push(calcItem);
      });
    });
    fieldCalculations[fieldName] = calcItems;
  });
  return fieldCalculations;
}
