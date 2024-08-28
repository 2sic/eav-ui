import { EavEntityDto } from '.';
import { InputTypeStrict } from '../../../../shared/fields/input-type-catalog';

/**
 * A JSON representation of an EavContentType.
 * This is a DTO (Data Transfer Object).
 */
export interface EavContentTypeAttributesDto {
  InputType: InputTypeStrict;
  IsTitle: boolean;
  Metadata: EavEntityDto[];
  Name: string;
  Type: string;
}
