import { Context as DnnContext } from '@2sic.com/dnn-sxc-angular';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { DnnBridgeComponent } from '../../eav-material-controls/input-types/dnn-bridge/dnn-bridge.component';
import { DnnBridgeConnectorParams, DnnBridgeDialogData, DnnBridgeType } from '../../eav-material-controls/input-types/dnn-bridge/dnn-bridge.models';
import { EavService } from './eav.service';
import { AdamItem } from '../../../edit-types/src/AdamItem';

@Injectable()
export class DnnBridgeService {
  constructor(private http: HttpClient, private dnnContext: DnnContext, private eavService: EavService, private dialog: MatDialog) { }

  open(dialogType: DnnBridgeType, params: DnnBridgeConnectorParams, callback: (value: any) => void) {
    let dialogRef: MatDialogRef<DnnBridgeComponent>;

    const data: DnnBridgeDialogData = {
      connector: {
        params,
        valueChanged: (value: any) => {
          dialogRef.close();
          callback(value);
        },
        dialogType,
      },
    };
    dialogRef = this.dialog.open(DnnBridgeComponent, {
      data,
      width: '650px',
    });
    return dialogRef;
  }

  getUrlOfId(link: string, contentType: string, guid: string, field: string) {
    return this.http.get(this.dnnContext.$2sxc.http.apiUrl('cms/edit/lookupLink'), {
      params: {
        link,
        ...(guid && { guid }),
        ...(contentType && { contentType }),
        ...(field && { field }),
        appid: this.eavService.eavConfig.appId.toString(),
      }
    }) as Observable<string>;
  }


  /**
   * New implementation returning richer object
   * The new object has
   * - Adam - a rich ADAM item with preview etc. (is null if the link was not able to resolve)
   * - Value - just a string, in case the original link was not an ADAM or permissions didn't allow resolving
   */
  // TODO: SPM - pls update all code use to work with this from now on,
  // then info @2dm so we can drop the old method in the backend
  getLinkInfo(link: string, contentType: string, guid: string, field: string) {
    return this.http.get(this.dnnContext.$2sxc.http.apiUrl('cms/edit/linkInfo'), {
      params: {
        link,
        ...(guid && { guid }),
        ...(contentType && { contentType }),
        ...(field && { field }),
        appid: this.eavService.eavConfig.appId.toString(),
      }
    }) as Observable<{ Adam: AdamItem, Value: string }>;
  }

}
