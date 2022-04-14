import { Field } from '../models/field.model';

export interface ContentTypeFieldsInputTypeParams {
  onChangeInputType(field: Field): void;
}
