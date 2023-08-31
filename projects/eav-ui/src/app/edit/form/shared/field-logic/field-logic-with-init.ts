import { FieldValue } from 'projects/edit-types';
import { EavConfig } from '../../../shared/models';

export interface FieldLogicWithValueInit {
  processValueOnLoad(value: FieldValue, eavConfig: EavConfig): FieldValue;
}