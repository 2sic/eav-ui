import { Component, ViewChild, ViewContainerRef } from '@angular/core';

@Component({
  selector: 'app-label-wrapper',
  templateUrl: './label-wrapper.component.html',
  styleUrls: ['./label-wrapper.component.css']
})
export class LabelWrapperComponent {
  @ViewChild('fieldComponent', { read: ViewContainerRef }) fieldComponent: ViewContainerRef;
}
