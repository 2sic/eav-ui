import { RichResult } from '../../shared/models/rich-result';
import { CodeGenerator } from './code-generator';
import { EditionDto, Edition } from './edition';


export interface EditionDataDto extends RichResult {
  editions: EditionDto[];
  isConfigured: boolean;
  generators: CodeGenerator[];
}

export interface EditionData extends EditionDataDto {
  editions: Edition[];
}
