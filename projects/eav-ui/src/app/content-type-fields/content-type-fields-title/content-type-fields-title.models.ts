import { Field } from '../../shared/fields/field.model';

export interface ContentTypeFieldsTitleParams {
  onSetTitle(field: Field): void;
}
