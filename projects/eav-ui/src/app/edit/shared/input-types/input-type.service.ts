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
      const specs = this.getSpecsInternal(attribute, inputTypes);
      return {
        name: attribute.Name,
        inputType: specs.inputType,
      } satisfies AttributeInputType;
    });
  }

  getSpecs(attribute: EavContentTypeAttribute): InputTypeSpecs {
    return this.getSpecsInternal(attribute, this.getAll());
  }

  private getSpecsInternal(attribute: EavContentTypeAttribute, inputTypes: InputTypeMetadata[]): InputTypeSpecs {
    const inputTypeMetadata = inputTypes.find(i => i.Type === attribute.InputType);
    const inputType = attribute.InputType as Of<typeof InputTypeCatalog>;
    const calculated: InputTypeSpecs = {
      inputType,
      isExternal: !!inputTypeMetadata?.AngularAssets,
      isString: inputType.toString().startsWith('string'),
      componentTagName: `field-${inputType}`,
      componentTagDialogName: `field-${inputType}-dialog`,
      metadata: inputTypeMetadata,
      isNewPicker: InputTypeHelpers.isNewPicker(inputType),
    };
    return calculated;
  }


}
