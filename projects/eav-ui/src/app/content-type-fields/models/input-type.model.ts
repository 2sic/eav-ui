import { InputTypeStrict } from '../constants/input-type.constants';

export interface InputType {
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
