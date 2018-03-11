import { Component, OnInit, ViewChild, ViewContainerRef, Input } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { FieldWrapper } from '../../../eav-dynamic-form/model/field-wrapper';

@Component({
  selector: 'app-field-group-wrapper',
  templateUrl: './field-group-wrapper.component.html',
  styleUrls: ['./field-group-wrapper.component.css']
})
export class FieldGroupWrapperComponent implements FieldWrapper, OnInit {
  @ViewChild('fieldComponent', { read: ViewContainerRef }) fieldComponent: ViewContainerRef;

  @Input() config;
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
