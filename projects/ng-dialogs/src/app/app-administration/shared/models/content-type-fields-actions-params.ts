import { ICellRendererParams } from '@ag-grid-community/core';

import { Field } from './field.model';

export interface ContentTypeFieldsActionsParams extends ICellRendererParams {
  onRename(field: Field): void;
  onDelete(field: Field): void;
  onOpenPermissions(field: Field): void;
}
