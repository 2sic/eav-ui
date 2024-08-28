import { Field } from '../../shared/fields/field.model';

export interface ContentTypeFieldsInputTypeParams {
  onChangeInputType(field: Field): void;
}
