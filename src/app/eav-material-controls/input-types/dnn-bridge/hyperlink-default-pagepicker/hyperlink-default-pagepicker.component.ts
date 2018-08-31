import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material';
import { AdminDialogData } from '../../../../shared/models/eav/admin-dialog-data';
import { DnnBridgeDialogData } from '../../../../shared/models/dnn-bridge/dnn-bridge-connector';

@Component({
  selector: 'app-hyperlink-default-pagepicker',
  templateUrl: './hyperlink-default-pagepicker.component.html',
  styleUrls: ['./hyperlink-default-pagepicker.component.css']
})
export class HyperlinkDefaultPagepickerComponent implements OnInit {

  constructor(@Inject(MAT_DIALOG_DATA) public dialogData: DnnBridgeDialogData) { }

  get bridge() {
    return this.dialogData.connector;
  }

  ngOnInit() {
    console.log('HyperlinkDefaultPagepickerComponent formDialogData: ', this.dialogData);
  }

}
