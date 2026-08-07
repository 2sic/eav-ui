import { Of } from '../../../../../core';
import { InputTypeCatalog } from './input-type-catalog';

export interface InputTypeMetadata {
  uiAssets: Record<'default' | string, string>;
  description: string;
  disableI18n: boolean;
  isDefault?: boolean;
  isObsolete?: boolean;
  isRecommended?: boolean;
  label: string;
  obsoleteMessage?: string;
  type: Of<typeof InputTypeCatalog>;
  useAdam: boolean;
}
