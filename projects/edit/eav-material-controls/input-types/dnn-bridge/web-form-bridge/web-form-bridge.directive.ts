import { Directive, Inject, OnInit, Input, ElementRef } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DnnBridgeDialogData } from '../../../../shared/models/dnn-bridge/dnn-bridge-connector';
import { EavService } from '../../../../shared/services/eav.service';
import { fromEvent } from 'rxjs';
import { EavConfiguration } from '../../../../shared/models/eav-configuration';

@Directive({ selector: '[appWebFormBridge]' })
export class WebFormBridgeDirective implements OnInit {
  @Input() bridgeSyncHeight: boolean;

  get bridge() { return this.dialogData.connector; }
  get type() { return this.dialogData.type; }

  private eavConfig: EavConfiguration;
  private webFormsBridgeUrl = '';

  constructor(
    @Inject(MAT_DIALOG_DATA) public dialogData: DnnBridgeDialogData,
    private elementRef: ElementRef,
    private eavService: EavService,
  ) {
    this.eavConfig = this.eavService.getEavConfiguration();
  }

  ngOnInit() {
    this.webFormsBridgeUrl = this.eavConfig.portalroot + 'Default.aspx?tabid=' +
      this.eavConfig.tid + '&ctl=webformsbridge&mid=' + this.eavConfig.mid +
      '&dnnprintmode=true&SkinSrc=%5bG%5dSkins%2f_default%2fNo+Skin&ContainerSrc=%5bG%5dContainers%2f_default%2fNo+Container';

    this.link(this.elementRef.nativeElement);
  }

  link(elem: any) {
    let params = '';
    if (this.bridge.params) {
      params = Object.keys(this.bridge.params).map(prop => {
        if (this.bridge.params[prop] === null || this.bridge.params[prop] === '') {
          return;
        }
        return [prop, this.bridge.params[prop]].map(encodeURIComponent).join('=');
      }).join('&');
    }

    elem.src = this.webFormsBridgeUrl + '&type=' + this.type + (this.bridge.params ? '&' + params : '');

    fromEvent(elem, 'load').subscribe(s => {
      const w = elem.contentWindow || elem;
      // test if the connectBridge works, if not, it's usually a telerik-not-installed issue
      if (!w.connectBridge) {
        return alert(`can't connect to the dialog - you are probably running a new DNN(v.8 +) and didn't
        activate the old Telerik components.Please install these in the host > extensions to get this to work`);
      }

      w.connectBridge(this.bridge);

      // Sync height
      // if (this.bridgeSyncHeight === 'true') { // TODO: see why this string?
      if (this.bridgeSyncHeight) {

        const resize = () => {
          elem.css('height', '');
          elem.css('height', w.document.body.scrollHeight + 'px');
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
    });
  }
}
