import { Directive, Inject, OnInit, ElementRef } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { fromEvent } from 'rxjs';
import { take } from 'rxjs/operators';

import { DnnBridgeDialogData } from './web-form-bridge.models';
import { EavService } from '../../../../shared/services/eav.service';
import { EavConfig } from '../../../../shared/models/eav-configuration';

@Directive({ selector: '[appWebFormBridge]' })
export class WebFormBridgeDirective implements OnInit {
  private eavConfig: EavConfig;

  constructor(@Inject(MAT_DIALOG_DATA) private dialogData: DnnBridgeDialogData, eavService: EavService, private elementRef: ElementRef) {
    this.eavConfig = eavService.getEavConfig();
  }

  ngOnInit() {
    const bridge = this.dialogData.connector;
    const type = this.dialogData.type;
    const element = this.elementRef.nativeElement;

    const webFormsBridgeUrl = this.eavConfig.portalroot + 'Default.aspx?tabid=' +
      this.eavConfig.tid + '&ctl=webformsbridge&mid=' + this.eavConfig.mid +
      '&dnnprintmode=true&SkinSrc=%5bG%5dSkins%2f_default%2fNo+Skin&ContainerSrc=%5bG%5dContainers%2f_default%2fNo+Container';

    const params = !bridge.params
      ? ''
      : Object.keys(bridge.params)
        .map(prop => {
          if (bridge.params[prop] === null || bridge.params[prop] === '') { return; }
          return [prop, bridge.params[prop]].map(encodeURIComponent).join('=');
        })
        .join('&');

    element.src = webFormsBridgeUrl + '&type=' + type + (bridge.params ? '&' + params : '');

    fromEvent(element, 'load').pipe(take(1)).subscribe(e => {
      const w = element.contentWindow || element;
      if (!w.connectBridge) {
        return alert(`Can't connect to the dialog - you are probably running a new DNN(v.8 +) and didn't activate the old Telerik components. Please install these in the host > extensions to get this to work`);
      }
      w.connectBridge(bridge);
    });
  }
}
