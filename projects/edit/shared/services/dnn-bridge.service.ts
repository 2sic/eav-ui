import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { Context as DnnContext } from '@2sic.com/dnn-sxc-angular';

import { DnnBridgeConnector } from '../models/dnn-bridge/dnn-bridge-connector';
import { EavAdminUiService } from './eav-admin-ui.service';
// tslint:disable-next-line:max-line-length
import { HyperlinkDefaultPagepickerComponent } from '../../eav-material-controls/input-types/dnn-bridge/hyperlink-default-pagepicker/hyperlink-default-pagepicker.component';
import { Context } from '../../../ng-dialogs/src/app/shared/services/context';

@Injectable()
export class DnnBridgeService {
  constructor(
    private http: HttpClient,
    private eavAdminUiService: EavAdminUiService,
    private dnnContext: DnnContext,
    private context: Context,
  ) { }

  open(oldValue: any, params: any, callback: any, dialog: MatDialog) {
    const type = 'pagepicker';
    const connector: DnnBridgeConnector = new DnnBridgeConnector(params, callback, type);

    let modalInstance: MatDialogRef<any, any>;
    connector.valueChanged = (value: any) => {
      modalInstance.close();
      callback(value);
    };
    connector.params.CurrentValue = oldValue;

    // Open dialog
    modalInstance = this.eavAdminUiService.openPagePickerModal(dialog, HyperlinkDefaultPagepickerComponent, type, connector);
    return modalInstance;
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
