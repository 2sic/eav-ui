import { Component, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
import { FieldWrapper } from '../../../model/field-wrapper';

@Component({
  selector: 'app-field-parent-wrapper',
  templateUrl: './field-parent-wrapper.component.html',
  styleUrls: ['./field-parent-wrapper.component.css']
})
export class FieldParentWrapperComponent extends FieldWrapper implements OnInit {
  @ViewChild('fieldComponent', { read: ViewContainerRef }) fieldComponent: ViewContainerRef;

  ngOnInit() {
  }
}
