import { Field } from '../models/field.model';

export interface ContentTypeFieldsTitleParams {
  onSetTitle(field: Field): void;
}
