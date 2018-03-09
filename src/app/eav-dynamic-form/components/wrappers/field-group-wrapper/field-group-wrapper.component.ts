import { Component, OnInit, ViewChild, ViewContainerRef, Input } from '@angular/core';
import { FieldWrapper } from '../../../model/field-wrapper';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'app-field-group-wrapper',
  templateUrl: './field-group-wrapper.component.html',
  styleUrls: ['./field-group-wrapper.component.css']
})
export class FieldGroupWrapperComponent extends FieldWrapper implements OnInit {
  @ViewChild('fieldComponent', { read: ViewContainerRef }) fieldComponent: ViewContainerRef;

  // @Input('group')
  // public
  // childForm: FormGroup;
  // @Input('group')
  // set group(value: FormGroup) {
  //   // this.selectedItem = Object.assign({}, value);
  //   // this.selectedItem = { ...value };
  //   this.childForm = value;
  // }
  ngOnInit() {
  }
}
