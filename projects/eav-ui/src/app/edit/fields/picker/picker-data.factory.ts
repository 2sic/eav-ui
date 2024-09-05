import { Injector } from '@angular/core';
import { transient } from '../../../core';
import { InputTypeHelpers } from '../../../shared/fields/input-type-helpers';
import { InputTypeSpecs } from '../../shared/input-types/input-type-specs.model';
import { PickerData } from './picker-data';

/**
 * Factory for creating PickerData instances.
 * Goal is to move all the logic for which combination of input types
 * result in what states etc. to here.
 * 
 * WIP
 */
export class PickerDataFactory {

  constructor(injector: Injector) {
    this.#injector = injector;
  }

  #injector: Injector;

  createPickerData(inputType: InputTypeSpecs): PickerData {
    return (InputTypeHelpers.isAnyPicker(inputType.inputType))
      ? transient(PickerData, this.#injector)
      : null;
  }
}