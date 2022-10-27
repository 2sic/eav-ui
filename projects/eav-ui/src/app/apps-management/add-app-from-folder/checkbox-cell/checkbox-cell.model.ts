import { PendingApp } from "../../models/app.model";

export interface CheckboxCellParams {
  onChange(pendingApp: PendingApp, enabled: boolean): void;
}
