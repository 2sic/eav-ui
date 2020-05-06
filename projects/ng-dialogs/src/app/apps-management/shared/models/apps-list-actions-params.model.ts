import { ICellRendererParams } from '@ag-grid-community/core';

import { App } from './app.model';

export interface AppsListActionsParams extends ICellRendererParams {
  onDelete(app: App): void;
}
