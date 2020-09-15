import { Component, OnInit, ChangeDetectionStrategy, Inject } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

import { DnnBridgeDialogData } from '../web-form-bridge/web-form-bridge.models';
import { EavService } from '../../../../shared/services/eav.service';

@Component({
  selector: 'app-pagepicker',
  templateUrl: './pagepicker.component.html',
  styleUrls: ['./pagepicker.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DnnBridgeComponent implements OnInit {
  iframeSrc: SafeResourceUrl;

  constructor(
    @Inject(MAT_DIALOG_DATA) private dialogData: DnnBridgeDialogData,
    private eavService: EavService,
    private sanitizer: DomSanitizer,
  ) { }

  ngOnInit() {
    const connector = this.dialogData.connector;

    let iframeSrc = this.eavService.eavConfig.portalRoot + 'Default.aspx'
      + '?tabid=' + this.eavService.eavConfig.tabId
      + '&ctl=webformsbridge'
      + '&mid=' + this.eavService.eavConfig.moduleId
      + '&dnnprintmode=true'
      + '&SkinSrc=%5bG%5dSkins%2f_default%2fNo+Skin'
      + '&ContainerSrc=%5bG%5dContainers%2f_default%2fNo+Container'
      + '&type=' + connector.dialogType;

    const paramKeys = Object.keys(connector.params);
    for (const key of paramKeys) {
      const value = (connector.params as any)[key];
      if (value == null || value === '') { continue; }
      iframeSrc += `&${key}=${encodeURIComponent(value)}`;
    }

    this.iframeSrc = this.sanitizer.bypassSecurityTrustResourceUrl(iframeSrc);
  }

  iframeLoaded(event: Event) {
    const iframe = event.target as HTMLIFrameElement;
    const w: any = iframe.contentWindow || iframe;
    if (!w.connectBridge) {
      return alert(`Can't connect to the dialog - you are probably running a new DNN(v.8 +) and didn't activate the old Telerik components. Please install these in the host > extensions to get this to work`);
    }
    w.connectBridge(this.dialogData.connector);
  }

}
