import { Component, ViewChild, ViewContainerRef } from '@angular/core';

@Component({
  selector: 'app-horizontal-input-wrapper',
  templateUrl: './horizontal-input-wrapper.component.html',
  styleUrls: ['./horizontal-input-wrapper.component.css']
})
export class HorizontalInputWrapperComponent {
  @ViewChild('fieldComponent', { read: ViewContainerRef }) fieldComponent: ViewContainerRef;
}
