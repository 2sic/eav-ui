import { EavAttributesOfTypeDto, EavValuesDto } from '.';
import { EavEntityAttributes } from '../eav';

/**
 * A JSON representation of EavAttributes.
 * It's basically a list containing each type (string, number, etc.).
 * That then contains an array of all the attributes of that type.
 * This is a DTO (Data Transfer Object).
 */
export class EavAttributesDto {
  [attributeType: string]: EavAttributesOfTypeDto<any>;

  static attributesToDto(attributes: EavEntityAttributes): EavAttributesDto {
    const attributesDto: EavAttributesDto = {};

    for (const [name, values] of Object.entries(attributes)) {
      const type = values.Type;
      if (attributesDto[type] == null) {
        attributesDto[type] = {};
      }
      attributesDto[type][name] = EavValuesDto.valuesToDto(values);
    }
    return attributesDto;
  }
}
