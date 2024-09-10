import { Injectable, Injector } from '@angular/core';
import { transient } from '../../../core';
import { InputTypeHelpers } from '../../../shared/fields/input-type-helpers';
import { InputTypeSpecs } from '../../shared/input-types/input-type-specs.model';
import { PickerData } from './picker-data';
import { classLog } from '../../../shared/logging';
import { InputTypeService } from '../../shared/input-types/input-type.service';
import { EavContentTypeAttribute, EavEntityAttributes } from '../../shared/models/eav';

/**
 * Factory for **creating** PickerData instances.
 * It will not set them up yet, because for that it needs the FieldState
 * which is not available at this time.
 */
@Injectable()
export class PickerDataFactory {

  log = classLog({PickerDataFactory});

  constructor(private injector: Injector, private inputTypeSvc: InputTypeService) { }

  createPickersForAttributes(attributes: EavContentTypeAttribute[]): Record<string, PickerData> {
    const fields = attributes.map(a => ({ name: a.Name, inputType: this.inputTypeSvc.getSpecs(a)}));
    return this.#createPickersData(fields);
  }


  #createPickersData(fields: { name: string, inputType: InputTypeSpecs}[]): Record<string, PickerData> {
    const array = fields
      .map(it => ({ name: it.name, picker: this.#createOne(it.inputType)}))
      .filter(it => it.picker !== null);

    return array.reduce((acc, it) => {
      acc[it.name] = it.picker;
      return acc;
    }, {} as Record<string, PickerData>);
  }

  #createOne(inputType: InputTypeSpecs): PickerData {
    return (InputTypeHelpers.isAnyPicker(inputType.inputType))
      ? transient(PickerData, this.injector)
      : null;
  }
};
