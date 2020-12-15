import { ChangeDetectionStrategy, Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { EavService } from '../../../shared/services/eav.service';
import { DnnBridgeDialogData } from './dnn-bridge.models';

@Component({
  selector: 'app-dnn-bridge',
  templateUrl: './dnn-bridge.component.html',
  styleUrls: ['./dnn-bridge.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DnnBridgeComponent implements OnInit {
  iframeSrc: string;

  constructor(
    @Inject(MAT_DIALOG_DATA) private dialogData: DnnBridgeDialogData,
    private eavService: EavService,
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
      const value: string = (connector.params as any)[key];
      if (value == null || value === '') { continue; }
      iframeSrc += `&${key}=${encodeURIComponent(value)}`;
    }

    this.iframeSrc = iframeSrc;
  }

  iframeLoaded(event: Event) {
    const iframe = event.target as HTMLIFrameElement;
    const w = iframe.contentWindow || iframe as any;
    // spm 2020-12-15 DNN 9.8.0 with Telerik controls removed loads iframe 2 times.
    // First load is missing data and only second load is correct.
    // https://github.com/dnnsoftware/Dnn.Platform/releases/tag/v9.8.0
    if (w == null || w.connectBridge == null) { return; }
    w.connectBridge(this.dialogData.connector);
  }

}
