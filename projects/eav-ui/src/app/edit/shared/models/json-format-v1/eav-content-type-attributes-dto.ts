import { EavEntityDto } from '.';
import { InputTypeStrict } from '../../../../content-type-fields/constants/input-type.constants';

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
