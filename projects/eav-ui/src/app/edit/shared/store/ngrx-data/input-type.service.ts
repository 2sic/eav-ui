import { Injectable } from '@angular/core';
import { InputType } from '../../../../content-type-fields/models/input-type.model';
import { EavContentTypeAttribute } from '../../models/eav';
import { AttributeInputType } from '../../../../../../../edit-types/src/InputTypeName';
import { InputTypeStrict } from '../../../../content-type-fields/constants/input-type.constants';
import { InputTypeSpecs } from '../../../state/fields-configs.model';


@Injectable({ providedIn: 'root' })
export class InputTypeService /* extends BaseDataService<InputType> TODO:: Old Code Remove */ {

  #inputTypes: Record<string, InputType> = {};

  // constructor(serviceElementsFactory: EntityCollectionServiceElementsFactory) {
  //   super('InputType', serviceElementsFactory);
  // }

  //#region Add / Clear Cache

  addInputTypes(inputTypes: InputType[]): void {
    this.addToCache(inputTypes);
  }

  private addToCache(inputTypes: InputType[]): void {
    // TODO:: Old Code, remove after testing ist done
    // this.addManyToCache(inputTypes);

    inputTypes.forEach(input => {
      this.#inputTypes[input.Type] = input;
    });
  }

  public clearCache(): void {
    this.#inputTypes = {};
  }

  //#endregion

  //#region Getters

  getInputType(type: string): InputType {
    // TODO:: Old Code, remove after testing ist done
    // return this.cache().find(i => i.Type === type);
    return this.#inputTypes[type];
  }

  getInputTypes(): InputType[] {
    // TODO:: Old Code, remove after testing ist done
    // return this.cache();
    return Object.values(this.#inputTypes);
  }

  // TODO:: Not in used
  // getInputTypes$(): Observable<InputType[]> {
  //   // TODO:: Old Code, remove after testing ist done
  //   // return this.cache$;
  //   return of(Object.values(this.inputTypes));
  // }

  //#endregion


  /**
   * Get Name specs with a nice name and a longer name
   * Note: ATM only used in the external connector, not sure why it's even here.
   */
  getAttributeInputTypes(attributes: EavContentTypeAttribute[]): AttributeInputType[] {
    const inputTypes = this.getInputTypes();
    return attributes.map(attribute => {
      const calculatedInputType = this.calculateInputTypeInt(attribute, inputTypes);
      return {
        name: attribute.Name,
        inputType: calculatedInputType.inputType,
      } satisfies AttributeInputType;
    });
  }

  getSpecs(attribute: EavContentTypeAttribute): InputTypeSpecs {
    return this.calculateInputTypeInt(attribute, this.getInputTypes());
  }

  private calculateInputTypeInt(attribute: EavContentTypeAttribute, inputTypes: InputType[]): InputTypeSpecs {
    const inputType = inputTypes.find(i => i.Type === attribute.InputType);
    const calculated: InputTypeSpecs = {
      inputType: attribute.InputType as InputTypeStrict,
      isExternal: inputType ? !!inputType.AngularAssets : false,
    };
    return calculated;
  }


}
