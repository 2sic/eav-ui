import { ICellRendererParams } from '@ag-grid-community/core';

import { App } from '../../../shared/models/app.model';

export interface AppsListActionsParams extends ICellRendererParams {
  onDelete(app: App): void;
}
