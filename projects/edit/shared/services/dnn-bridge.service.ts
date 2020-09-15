import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { Context as DnnContext } from '@2sic.com/dnn-sxc-angular';

import { DnnBridgeDialogData, DnnBridgeConnectorParams } from '../../eav-material-controls/input-types/dnn-bridge/web-form-bridge/web-form-bridge.models';
import { DnnBridgeComponent } from '../../eav-material-controls/input-types/dnn-bridge/hyperlink-default-pagepicker/pagepicker.component';
import { EavService } from './eav.service';

@Injectable()
export class DnnBridgeService {
  constructor(private http: HttpClient, private dnnContext: DnnContext, private eavService: EavService, private dialog: MatDialog) { }

  open(params: DnnBridgeConnectorParams, callback: (value: any) => void) {
    let dialogRef: MatDialogRef<DnnBridgeComponent>;

    const data: DnnBridgeDialogData = {
      connector: {
        params,
        valueChanged: (value: any) => {
          dialogRef.close();
          callback(value);
        },
        dialogType: 'pagepicker',
      },
    };
    dialogRef = this.dialog.open(DnnBridgeComponent, {
      data,
      width: '650px',
    });
    return dialogRef;
  }

  getUrlOfId(url: string, contentType: string, guid: string, field: string) {
    return this.http.get(this.dnnContext.$2sxc.http.apiUrl('dnn/Hyperlink/ResolveHyperlink'), {
      params: {
        hyperlink: url,
        ...(guid && { guid }),
        ...(contentType && { contentType }),
        ...(field && { field }),
        appid: this.eavService.eavConfig.appId.toString(),
      }
    }) as Observable<string>;
  }
}
