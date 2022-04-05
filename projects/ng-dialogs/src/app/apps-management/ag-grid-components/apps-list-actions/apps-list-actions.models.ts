import { ICellRendererParams } from '@ag-grid-community/core';
import { App } from '../../models/app.model';

export interface AppsListActionsParams extends ICellRendererParams {
  onDelete(app: App): void;
  onFlush(app: App): void;
  onOpenLightspeed(app: App): void;
}
