import { EavEntity } from '../../shared/models/eav';

export interface FormValues {
  [fieldName: string]: FormValue;
}

export type FormValue = any;

export interface FieldCalculations {
  [fieldName: string]: EavEntity[];
}
