import { Injectable } from '@angular/core';
import { EntityCollectionServiceElementsFactory } from '@ngrx/data';
import { Observable } from 'rxjs';
import { InputType } from '../../../../content-type-fields/models/input-type.model';
import { BaseDataService } from './base-data.service';
import { EavContentTypeAttribute } from '../../models/eav';
import { InputTypeName } from '../../../../../../../edit-types/src/InputTypeName';
import { InputTypeStrict } from '../../../../content-type-fields/constants/input-type.constants';
import { CalculatedInputType } from '../../../state/fields-configs.model';


// TODO: @2dm - try to get out of store, and make it provide signals
@Injectable({ providedIn: 'root' })
export class InputTypeService extends BaseDataService<InputType> {
  constructor(serviceElementsFactory: EntityCollectionServiceElementsFactory) {
    super('InputType', serviceElementsFactory);
  }

  addInputTypes(inputTypes: InputType[]): void {
    this.addManyToCache(inputTypes);
  }

  getInputType(type: string): InputType {
    return this.cache().find(i => i.Type === type);
  }

  getInputTypes(): InputType[] {
    return this.cache();
  }

  getInputTypes$(): Observable<InputType[]> {
    return this.cache$;
  }

  getInputTypeNames(attributes: EavContentTypeAttribute[]): InputTypeName[] {
    const inputTypes = this.getInputTypes();
    return attributes.map(attribute => {
      const calculatedInputType = this.calculateInputTypeInt(attribute, inputTypes);
      const inputTypeName: InputTypeName = {
        name: attribute.Name,
        inputType: calculatedInputType.inputType,
      };
      return inputTypeName;
    });
  }

  calculateInputType(attribute: EavContentTypeAttribute): CalculatedInputType {
    return this.calculateInputTypeInt(attribute, this.getInputTypes());
  }
  
  private calculateInputTypeInt(attribute: EavContentTypeAttribute, inputTypes: InputType[]): CalculatedInputType {
    const inputType = inputTypes.find(i => i.Type === attribute.InputType);
    const calculated: CalculatedInputType = {
      inputType: attribute.InputType as InputTypeStrict,
      isExternal: inputType ? !!inputType.AngularAssets : false,
    };
    return calculated;
  }

}
