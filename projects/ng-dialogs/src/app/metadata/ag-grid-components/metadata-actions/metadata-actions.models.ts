import { ICellRendererParams } from '@ag-grid-community/core';
import { MetadataItem } from '../../models/metadata.model';

export interface MetadataActionsParams extends ICellRendererParams {
  onDelete(metadata: MetadataItem): void;
}
