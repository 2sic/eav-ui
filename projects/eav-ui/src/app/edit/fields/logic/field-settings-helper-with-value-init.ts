import { AdamItem } from '../../../../../../edit-types/src/AdamItem';
import { FieldValue } from '../../../../../../edit-types/src/FieldValue';

export interface FieldSettingsHelperWithValueInit {
  processValueOnLoad(value: FieldValue, adamItems: AdamItem[]): FieldValue;
}