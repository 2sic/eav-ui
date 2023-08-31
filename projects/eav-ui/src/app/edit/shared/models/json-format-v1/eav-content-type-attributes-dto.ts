import { InputTypeStrict } from 'projects/eav-ui/src/app/content-type-fields/constants/input-type.constants';
import { EavEntityDto } from '.';

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
