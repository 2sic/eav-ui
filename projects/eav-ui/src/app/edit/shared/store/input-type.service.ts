import { Injectable } from '@angular/core';
import { InputType } from '../../../content-type-fields/models/input-type.model';
import { EavContentTypeAttribute } from '../models/eav';
import { AttributeInputType } from '../../../../../../edit-types/src/InputTypeName';
import { InputTypeStrict } from '../../../content-type-fields/constants/input-type.constants';
import { InputTypeSpecs } from '../../state/fields-configs.model';
import { SignalStoreBase } from './signal-store-base';

const logThis = false;
const nameOfThis = 'InputTypeService';

@Injectable({ providedIn: 'root' })
export class InputTypeService extends SignalStoreBase<string, InputType> {

  constructor() {
    super({ nameOfThis, logThis });
  }

  override getId = (item: InputType) => item.Type;

  /**
   * Get Name specs with a nice name and a longer name
   * Note: ATM only used in the external connector, not sure why it's even here.
   */
  getAttributeInputTypes(attributes: EavContentTypeAttribute[]): AttributeInputType[] {
    const inputTypes = this.getAll();
    return attributes.map(attribute => {
      const calculatedInputType = this.calculateInputTypeInt(attribute, inputTypes);
      return {
        name: attribute.Name,
        inputType: calculatedInputType.inputType,
      } satisfies AttributeInputType;
    });
  }

  getSpecs(attribute: EavContentTypeAttribute): InputTypeSpecs {
    return this.calculateInputTypeInt(attribute, this.getAll());
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
