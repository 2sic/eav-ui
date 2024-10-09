import { EavEntityDto } from '.';
import { Of } from '../../../../../../../core';
import { InputTypeCatalog } from '../../../../shared/fields/input-type-catalog';

/**
 * A JSON representation of an EavContentType.
 * This is a DTO (Data Transfer Object).
 */
export interface EavContentTypeAttributesDto {
  InputType: Of<typeof InputTypeCatalog>;
  IsTitle: boolean;
  Metadata: EavEntityDto[];
  Name: string;
  Type: string;
}
