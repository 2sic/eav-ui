import { PendingApp } from "../../models/app.model";

export interface CheckboxCellParams {
  isDisabled: boolean;
  onChange(pendingApp: PendingApp, enabled: boolean): void;
}
