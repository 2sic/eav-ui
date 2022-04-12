import { ICellRendererParams } from '@ag-grid-community/core';
import { Field } from '../models/field.model';

export interface ContentTypeFieldsTitleParams extends ICellRendererParams {
  onSetTitle(field: Field): void;
}
