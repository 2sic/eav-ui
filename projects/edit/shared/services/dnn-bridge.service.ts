import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { Context as DnnContext } from '@2sic.com/dnn-sxc-angular';

import { DnnBridgeConnector, DnnBridgeDialogData } from '../models/dnn-bridge/dnn-bridge-connector';
// tslint:disable-next-line:max-line-length
import { HyperlinkDefaultPagepickerComponent } from '../../eav-material-controls/input-types/dnn-bridge/hyperlink-default-pagepicker/hyperlink-default-pagepicker.component';
import { Context } from '../../../ng-dialogs/src/app/shared/services/context';

@Injectable()
export class DnnBridgeService {
  constructor(private http: HttpClient, private dnnContext: DnnContext, private context: Context) { }

  open(oldValue: any, params: any, callback: any, dialog: MatDialog) {
    const type = 'pagepicker';
    const connector: DnnBridgeConnector = new DnnBridgeConnector(params, callback, type);

    let dialogRef: MatDialogRef<any, any>;
    connector.valueChanged = (value: any) => {
      dialogRef.close();
      callback(value);
    };
    connector.params.CurrentValue = oldValue;

    dialogRef = dialog.open(HyperlinkDefaultPagepickerComponent, {
      width: '650px',
      data: { type, connector } as DnnBridgeDialogData,
    });
    return dialogRef;
  }

  getUrlOfId(url: string, contentType: string, guid: string, field: string) {
    const urlLowered = url.toLowerCase();
    if (!urlLowered.includes('file:') && !urlLowered.includes('page:')) { return; }

    return this.http.get(this.dnnContext.$2sxc.http.apiUrl('dnn/Hyperlink/ResolveHyperlink'), {
      params: {
        hyperlink: url,
        ...(guid && { guid }),
        ...(contentType && { contentType }),
        ...(field && { field }),
        appid: this.context.appId.toString(),
      }
    }) as Observable<string>;
  }
}
