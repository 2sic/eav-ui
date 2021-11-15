import { ICellRendererParams } from '@ag-grid-community/core';
import { Metadata } from '../../models/metadata.model';

export interface MetadataActionsParams extends ICellRendererParams {
  onDelete(metadata: Metadata): void;
}
