import { EavValuesDto } from '.';

/**
 * A JSON representation of EavAttributes.
 * In JSON they are grouped by type (string, number, etc.).
 * Because of this, an Entity will have multiple of these objects, each containing all the attributes of that type.
 * This is a DTO (Data Transfer Object).
 */
export interface EavAttributesOfTypeDto<T> {
  [attributeName: string]: EavValuesDto<T>;
}
