import { Field } from '../models/field.model';

export interface ContentTypeFieldsActionsParams {
  onRename(field: Field): void;
  onDelete(field: Field): void;
  onOpenPermissions(field: Field): void;
  onOpenMetadata(field: Field): void;
}
