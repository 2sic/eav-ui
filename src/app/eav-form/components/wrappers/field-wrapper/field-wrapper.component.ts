import { Component, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
import { FieldWrapper } from '../../../model/field-wrapper';

@Component({
  selector: 'app-field-wrapper',
  templateUrl: './field-wrapper.component.html',
  styleUrls: ['./field-wrapper.component.css']
})
export class FieldWrapperComponent extends FieldWrapper implements OnInit {
  @ViewChild('fieldComponent', { read: ViewContainerRef }) fieldComponent: ViewContainerRef;

  ngOnInit() {
  }

}
