import { Field } from '../models/field.model';

export type ContentTypeFieldsActions = 'rename' | 'delete' | 'permissions' | 'metadata' | 'shareOrInherit' | 'image';

export interface ContentTypeFieldsActionsParams {
  // onRename(field: Field): void;
  // onDelete(field: Field): void;
  // onOpenPermissions(field: Field): void;
  // onOpenMetadata(field: Field): void;
  // onShareOrInherit(field: Field): void;
  do(verb: ContentTypeFieldsActions, field: Field): void;
}
