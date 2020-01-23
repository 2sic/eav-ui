

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { throwError, Observable } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

import { UrlConstants } from '../constants/url-constants';
import { DnnBridgeConnector } from '../models/dnn-bridge/dnn-bridge-connector';
import { EavAdminUiService } from './eav-admin-ui.service';
// tslint:disable-next-line:max-line-length
import { HyperlinkDefaultPagepickerComponent } from '../../eav-material-controls/input-types/dnn-bridge/hyperlink-default-pagepicker/hyperlink-default-pagepicker.component';
import { EavConfiguration } from '../models/eav-configuration';
import { EavService } from './eav.service';

@Injectable()
export class DnnBridgeService {
  private eavConfig: EavConfiguration;

  constructor(
    private httpClient: HttpClient,
    private eavAdminUiService: EavAdminUiService,
    private eavService: EavService,
  ) {
    this.eavConfig = this.eavService.getEavConfiguration();
  }

  open(oldValue: any, params: any, callback: any, dialog: MatDialog) {
    const type = 'pagepicker';

    const connector: DnnBridgeConnector = new DnnBridgeConnector(params, callback, type);

    let modalInstance: MatDialogRef<any, any> = null;
    connector.valueChanged = (value: any) => {
      modalInstance.close();
      callback(value);
    };
    connector.params.CurrentValue = oldValue;
    // Open dialog
    modalInstance = this.eavAdminUiService.openPagePickerModal(dialog, HyperlinkDefaultPagepickerComponent, type, connector);

    console.log(' dialogRef.formDialogData', modalInstance);

    // console.log($uibModal);
    // connector.modalInstance = $uibModal.open({
    //   templateUrl: 'fields/dnn-bridge/hyperlink-default-pagepicker.html',
    //   resolve: {
    //     bridge: function () {
    //       return connector;
    //     }
    //   },
    //   /*@ngInject*/
    //   controller: function ($scope, bridge) {
    //     $scope.bridge = bridge;
    //   },
    //   windowClass: 'sxc-dialog-filemanager'
    // });

    return modalInstance;
  }

  public getUrlOfId(appId: string, idCode: string, contentType: string, guid: string, field: string): Observable<any> {
    const linkLowered = idCode.toLowerCase();

    if (linkLowered.indexOf('file:') !== -1 || linkLowered.indexOf('page:') !== -1) {
      return this.httpClient.get(this.eavConfig.portalroot + UrlConstants.apiRoot + 'dnn/Hyperlink/ResolveHyperlink?hyperlink='
        + encodeURIComponent(idCode)
        + (guid ? '&guid=' + guid : '')
        + (contentType ? '&contentType=' + contentType : '')
        + (field ? '&field=' + field : '')
        + '&appId=' + appId)
        .pipe(
          map((data: any) => {
            return data;
          }),
          // tap(data => console.log('Hyperlink data: ', data)),
          catchError(error => this.handleError(error))
        );
    } else {
      return null;
    }
  }

  private handleError(error: any) {
    // In a real world app, we might send the error to remote logging infrastructure
    const errMsg = error.message || 'Server error';
    console.error(errMsg);
    return throwError(errMsg);
  }
}
