import { CalculatedInputType } from '.';
import { FieldSettings, FieldValue } from '../../../../../../edit-types';
import { TranslationStateCore } from '../../form/wrappers/localization-wrapper/translate-menu/translate-menu.models';

export interface FieldsProps {
  [attributeName: string]: FieldProps;
}

export interface FieldProps {
  calculatedInputType: CalculatedInputType;
  constants: FieldConstants;
  settings: FieldSettings;
  translationState: TranslationState;
  /** empty-default value is null */
  value: FieldValue;
  wrappers: string[];
}

export interface FieldConstants {
  angularAssets?: string;
  contentTypeId?: string;
  dropzonePreviewsClass?: string;
  entityGuid?: string;
  entityId?: number;
  fieldName?: string;
  index?: number;
  initialDisabled?: boolean;
  inputType?: string;
  isExternal?: boolean;
  isLastInGroup?: boolean;
  type?: string;
}

export interface TranslationState extends TranslationStateCore {
  infoLabel: string;
  infoMessage: string;
}
