import { InputTypeStrict } from './input-type-catalog';

export interface InputTypeMetadata {
  AngularAssets?: string;
  Assets?: string;
  Description: string;
  DisableI18n: boolean;
  IsDefault?: boolean;
  IsObsolete?: boolean;
  IsRecommended?: boolean;
  Label: string;
  ObsoleteMessage?: string;
  Type: InputTypeStrict;
  UseAdam: boolean;
}