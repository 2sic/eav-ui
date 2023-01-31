import { EavContentTypeAttributesDto, EavEntityDto } from '.';

/**
 * A JSON representation of an EavContentType.
 * This is a DTO (Data Transfer Object).
 */
export interface EavContentTypeDto {
  Attributes: EavContentTypeAttributesDto[];
  Description: string;
  Id: string;
  Metadata: EavEntityDto[];
  Name: string;
  Scope: string;
}
