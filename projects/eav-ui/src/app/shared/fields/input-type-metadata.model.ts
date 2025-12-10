import { Of } from '../../../../../core';
import { InputTypeCatalog } from './input-type-catalog';

export interface InputTypeMetadata {
  UiAssets: Record<'default' | string, string>;
  Description: string;
  DisableI18n: boolean;
  IsDefault?: boolean;
  IsObsolete?: boolean;
  IsRecommended?: boolean;
  Label: string;
  ObsoleteMessage?: string;
  Type: Of<typeof InputTypeCatalog>;
  UseAdam: boolean;
}
