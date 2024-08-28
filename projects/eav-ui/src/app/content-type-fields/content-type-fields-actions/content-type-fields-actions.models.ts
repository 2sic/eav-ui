import { Field } from '../../shared/fields/field.model';

export type ContentTypeFieldsActions = 'rename' | 'delete' | 'permissions' | 'metadata' | 'shareOrInherit' | 'image';

export interface ContentTypeFieldsActionsParams {
  do(verb: ContentTypeFieldsActions, field: Field): void;
}
