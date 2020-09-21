import { ICellRendererParams } from '@ag-grid-community/core';

import { ContentType } from '../../models/content-type.model';

export interface DataLabelParams extends ICellRendererParams {
  onFilesDropped(contentType: ContentType, files: FileList): void;
}
