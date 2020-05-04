import { Injectable } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';

import { DnnBridgeDialogData } from '../models/dnn-bridge/dnn-bridge-connector';

@Injectable()
export class EavAdminUiService {
  constructor() { }

  public openPagePickerModal(dialog: MatDialog, component: any, type: string, connector: any) {
    return dialog.open(component, {
      width: '650px',
      data: { type, connector } as DnnBridgeDialogData,
    }) as MatDialogRef<any, any>;
  }
}
