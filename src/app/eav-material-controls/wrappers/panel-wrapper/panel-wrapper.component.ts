import { Component, ViewChild, ViewContainerRef } from '@angular/core';

@Component({
  selector: 'app-panel-wrapper',
  templateUrl: './panel-wrapper.component.html',
  styleUrls: ['./panel-wrapper.component.css']
})
export class PanelWrapperComponent {
  @ViewChild('fieldComponent', { read: ViewContainerRef }) fieldComponent: ViewContainerRef;
}
