import { Injectable } from '@angular/core';
import { Of } from '../../../../../../core';
import { AttributeInputType } from '../../../../../../edit-types/src/InputTypeName';
import { InputTypeCatalog } from '../../../shared/fields/input-type-catalog';
import { InputTypeHelpers } from '../../../shared/fields/input-type-helpers';
import { InputTypeMetadata } from '../../../shared/fields/input-type-metadata.model';
import { classLog } from '../../../shared/logging';
import { EavContentTypeAttribute } from '../models/eav';
import { SignalStoreBase } from '../store/signal-store-base';
import { InputTypeSpecs } from './input-type-specs.model';

@Injectable({ providedIn: 'root' })
export class InputTypeService extends SignalStoreBase<string, InputTypeMetadata> {

  constructor() {
    super(classLog({InputTypeService}, null));
  }

  override getId = (item: InputTypeMetadata) => item.Type;

  /**
   * Get Name specs with a nice name and a longer name
   * Note: ATM only used in the external connector, not sure why it's even here.
   */
  getAttributeInputTypes(attributes: EavContentTypeAttribute[]): AttributeInputType[] {
    const inputTypes = this.getAll();
    return attributes.map(attribute => {
      const specs = this.#getSpecsInternal(attribute.InputType, inputTypes);
      return {
        name: attribute.Name,
        inputType: specs.inputType,
      } satisfies AttributeInputType;
    });
  }

  getSpecs(attribute: EavContentTypeAttribute): InputTypeSpecs {
    return this.#getSpecsInternal(attribute.InputType, this.getAll());
  }

  #getSpecsInternal(inputType: Of<typeof InputTypeCatalog>, inputTypes: InputTypeMetadata[]): InputTypeSpecs {
    const inputTypeMetadata = inputTypes.find(i => i.Type === inputType);
    const name = inputType.toString();
    const calculated: InputTypeSpecs = {
      inputType,
      isExternal: !!inputTypeMetadata?.UiAssets?.default,
      mustUseGuid: !name.startsWith('string') && !name.startsWith('number'),
      componentTagName: `field-${inputType}`,
      componentTagDialogName: `field-${inputType}-dialog`,
      metadata: inputTypeMetadata,
      isNewPicker: InputTypeHelpers.isNewPicker(inputType),
    };
    return calculated;
  }

}
