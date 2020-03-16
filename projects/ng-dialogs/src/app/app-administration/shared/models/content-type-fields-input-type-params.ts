import { ICellRendererParams } from '@ag-grid-community/core';

import { Field } from './field.model';

export interface ContentTypeFieldsInputTypeParams extends ICellRendererParams {
  onChangeInputType(field: Field): void;
}
