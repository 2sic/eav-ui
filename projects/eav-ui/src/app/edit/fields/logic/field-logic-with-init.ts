import { FieldValue } from '../../../../../../edit-types/src/FieldValue';
import { AdamItem } from '../../../../../../edit-types/src/AdamItem';

export interface FieldLogicWithValueInit {
  processValueOnLoad(value: FieldValue, adamItems: AdamItem[]): FieldValue;
}