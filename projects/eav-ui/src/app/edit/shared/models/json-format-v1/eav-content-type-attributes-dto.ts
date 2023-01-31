import { EavEntityDto } from '.';

/**
 * A JSON representation of an EavContentType.
 * This is a DTO (Data Transfer Object).
 */
export interface EavContentTypeAttributesDto {
  InputType: string;
  IsTitle: boolean;
  Metadata: EavEntityDto[];
  Name: string;
  Type: string;
}
