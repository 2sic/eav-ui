import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { throwError, Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Context as DnnContext } from '@2sic.com/dnn-sxc-angular';

import { DnnBridgeConnector } from '../models/dnn-bridge/dnn-bridge-connector';
import { EavAdminUiService } from './eav-admin-ui.service';
// tslint:disable-next-line:max-line-length
import { HyperlinkDefaultPagepickerComponent } from '../../eav-material-controls/input-types/dnn-bridge/hyperlink-default-pagepicker/hyperlink-default-pagepicker.component';

@Injectable()
export class DnnBridgeService {
  constructor(private httpClient: HttpClient, private eavAdminUiService: EavAdminUiService, private dnnContext: DnnContext) { }

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

  getUrlOfId(appId: string, idCode: string, contentType: string, guid: string, field: string) {
    const linkLowered = idCode.toLowerCase();
    if (!(linkLowered.indexOf('file:') !== -1 || linkLowered.indexOf('page:') !== -1)) { return; }

    return this.httpClient
      .get(
        this.dnnContext.$2sxc.http.apiUrl('dnn/Hyperlink/ResolveHyperlink?hyperlink=')
        + encodeURIComponent(idCode)
        + (guid ? '&guid=' + guid : '')
        + (contentType ? '&contentType=' + contentType : '')
        + (field ? '&field=' + field : '')
        + '&appId=' + appId
      )
      .pipe(catchError(error => this.handleError(error))) as Observable<any>;
  }

  private handleError(error: Error) {
    const errMsg = error.message || 'Server error';
    console.error(errMsg);
    return throwError(errMsg);
  }
}
