import { ChangeDetectorRef, ViewContainerRef } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';

export interface EndpointLabelRenameParts {
  matDialog: MatDialog;
  viewContainerRef: ViewContainerRef;
  changeDetectorRef: ChangeDetectorRef;
  onConnectionsChanged: () => void;
}