import { Injectable } from '@angular/core';
import { EntityCollectionServiceElementsFactory } from '@ngrx/data';
import { Observable, of } from 'rxjs';
import { InputType } from '../../../../content-type-fields/models/input-type.model';
import { BaseDataService } from './base-data.service';
import { EavContentTypeAttribute } from '../../models/eav';
import { InputTypeName } from '../../../../../../../edit-types/src/InputTypeName';
import { InputTypeStrict } from '../../../../content-type-fields/constants/input-type.constants';
import { CalculatedInputType } from '../../../state/fields-configs.model';


// TODO: @2dm - try to get out of store, and make it provide signals
@Injectable({ providedIn: 'root' })
export class InputTypeService /* extends BaseDataService<InputType> TODO:: Old Code Remove */ {

  inputTypes: Record<string, InputType> = {};

  // constructor(serviceElementsFactory: EntityCollectionServiceElementsFactory) {
  //   super('InputType', serviceElementsFactory);
  // }

  addInputTypes(inputTypes: InputType[]): void {
    this.addToCache(inputTypes);
  }

  getInputType(type: string): InputType {
    // TODO:: Old Code, remove after testing ist done
    // return this.cache().find(i => i.Type === type);
    return this.inputTypes[type];
  }

  getInputTypes(): InputType[] {
    // TODO:: Old Code, remove after testing ist done
    // return this.cache();
    return Object.values(this.inputTypes);
  }

  getInputTypes$(): Observable<InputType[]> {
    // TODO:: Old Code, remove after testing ist done
    // return this.cache$;
    return of(Object.values(this.inputTypes));
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

  private addToCache(inputTypes: InputType[]): void {
    // TODO:: Old Code, remove after testing ist done
    // this.addManyToCache(inputTypes);

    inputTypes.forEach(input => {
      this.inputTypes[input.Type] = input;
    });
  }

  public clearCache(): void {
    this.inputTypes = {};
  }

}
