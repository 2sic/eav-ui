import { Component, ViewChild, ViewContainerRef } from '@angular/core';
import { FieldWrapper } from '@ngx-formly/core';

@Component({
  selector: 'app-text-entry-wrapper',
  templateUrl: './text-entry-wrapper.component.html',
  styleUrls: ['./text-entry-wrapper.component.css']
})
export class TextEntryWrapperComponent extends FieldWrapper {
  @ViewChild('fieldComponent', { read: ViewContainerRef }) fieldComponent: ViewContainerRef;


}
