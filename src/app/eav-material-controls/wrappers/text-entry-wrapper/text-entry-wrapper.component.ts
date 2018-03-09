import { Component, ViewChild, ViewContainerRef } from '@angular/core';

@Component({
  selector: 'app-text-entry-wrapper',
  templateUrl: './text-entry-wrapper.component.html',
  styleUrls: ['./text-entry-wrapper.component.css']
})
export class TextEntryWrapperComponent {
  @ViewChild('fieldComponent', { read: ViewContainerRef }) fieldComponent: ViewContainerRef;


}
