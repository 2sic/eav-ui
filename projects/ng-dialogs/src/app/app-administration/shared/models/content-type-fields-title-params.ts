import { ICellRendererParams } from '@ag-grid-community/core';

import { Field } from './field.model';

export interface ContentTypeFieldsTitleParams extends ICellRendererParams {
  onSetTitle(field: Field): void;
}
