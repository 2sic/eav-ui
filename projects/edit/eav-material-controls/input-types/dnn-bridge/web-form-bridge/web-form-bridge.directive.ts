import { Directive, Inject, OnInit, Input, ElementRef, OnDestroy } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { fromEvent, Subscription } from 'rxjs';

import { DnnBridgeConnector, DnnBridgeDialogData } from './web-form-bridge.models';
import { EavService } from '../../../../shared/services/eav.service';

@Directive({ selector: '[appWebFormBridge]' })
export class WebFormBridgeDirective implements OnInit, OnDestroy {
  @Input() bridgeSyncHeight: boolean;

  private bridge: DnnBridgeConnector;
  private type: string;
  private webFormsBridgeUrl: string;
  private element: HTMLIFrameElement;
  private subscription = new Subscription();

  constructor(@Inject(MAT_DIALOG_DATA) private dialogData: DnnBridgeDialogData, eavService: EavService, elementRef: ElementRef) {
    const eavConfig = eavService.getEavConfiguration();

    this.bridge = this.dialogData.connector;
    this.type = this.dialogData.type;
    this.webFormsBridgeUrl = eavConfig.portalroot + 'Default.aspx?tabid=' + eavConfig.tid + '&ctl=webformsbridge&mid=' + eavConfig.mid +
      '&dnnprintmode=true&SkinSrc=%5bG%5dSkins%2f_default%2fNo+Skin&ContainerSrc=%5bG%5dContainers%2f_default%2fNo+Container';
    this.element = elementRef.nativeElement;
  }

  ngOnInit() {
    this.link(this.element);
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  link(element: any) {
    let params = '';
    if (this.bridge.params) {
      params = Object.keys(this.bridge.params).map(prop => {
        if (this.bridge.params[prop] === null || this.bridge.params[prop] === '') { return; }
        return [prop, this.bridge.params[prop]].map(encodeURIComponent).join('=');
      }).join('&');
    }

    element.src = this.webFormsBridgeUrl + '&type=' + this.type + (this.bridge.params ? '&' + params : '');

    this.subscription.add(fromEvent(element, 'load').subscribe(s => {
      const w = element.contentWindow || element;
      // test if the connectBridge works, if not, it's usually a telerik-not-installed issue
      if (!w.connectBridge) {
        return alert(`Can't connect to the dialog - you are probably running a new DNN(v.8 +) and didn't activate the old Telerik components.Please install these in the host > extensions to get this to work`);
      }

      w.connectBridge(this.bridge);

      // Sync height
      if (this.bridgeSyncHeight) {
        const resize = () => {
          element.css('height', '');
          element.css('height', w.document.body.scrollHeight + 'px');
        };

        // w.$(w).resize(resize); // Performance issues when uncommenting this line...
        resize();
        w.$(w.document).ready(() => {
          resize();
        });
        w.$(w.document).on('triggerbridgeresize', () => {
          window.setTimeout(resize, 0);
        });
      }
    }));
  }
}
