import { AdamItem, FieldValue } from 'projects/edit-types';

export interface FieldLogicWithValueInit {
  processValueOnLoad(value: FieldValue, adamItems: AdamItem[]): FieldValue;
}