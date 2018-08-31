import { Directive, Inject, OnInit, Input } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material';
import { DnnBridgeDialogData } from '../../../../shared/models/dnn-bridge/dnn-bridge-connector';

@Directive({
  selector: '[appWebFormBridge]'
})
export class WebFormBridgeDirective implements OnInit {

  constructor(@Inject(MAT_DIALOG_DATA) public dialogData: DnnBridgeDialogData) { }

  @Input()
  bridge: any;

  @Input()
  bridgeType: string;

  @Input()
  bridgeSyncHeight: boolean;

  ngOnInit() {
    console.log('WebFormBridgeDirective formDialogData: ', this.dialogData);
    console.log('WebFormBridgeDirective bridgeType: ', this.bridgeType);
    console.log('WebFormBridgeDirective bridge: ', this.bridge);
    console.log('WebFormBridgeDirective bridgeSyncHeight: ', this.bridgeSyncHeight);
  }
}
