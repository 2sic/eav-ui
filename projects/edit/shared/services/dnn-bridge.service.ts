import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { Context as DnnContext } from '@2sic.com/dnn-sxc-angular';

import { DnnBridgeConnector, DnnBridgeDialogData } from '../../eav-material-controls/input-types/dnn-bridge/web-form-bridge/web-form-bridge.models';
import { PagepickerComponent } from '../../eav-material-controls/input-types/dnn-bridge/hyperlink-default-pagepicker/pagepicker.component';
import { EavService } from './eav.service';

@Injectable()
export class DnnBridgeService {
  constructor(private http: HttpClient, private dnnContext: DnnContext, private eavService: EavService) { }

  open(oldValue: any, params: any, callback: any, dialog: MatDialog) {
    const type = 'pagepicker';
    const connector: DnnBridgeConnector = {
      params,
      valueChanged: callback,
      dialogType: type,
    };

    let dialogRef: MatDialogRef<PagepickerComponent>;
    connector.valueChanged = (value: any) => {
      dialogRef.close();
      callback(value);
    };
    connector.params.CurrentValue = oldValue;

    const data: DnnBridgeDialogData = {
      type,
      connector,
    };
    dialogRef = dialog.open(PagepickerComponent, {
      data,
      width: '650px',
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
        appid: this.eavService.eavConfig.appId.toString(),
      }
    }) as Observable<string>;
  }
}
