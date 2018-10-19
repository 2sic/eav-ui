import { Component, OnInit, ViewContainerRef, ViewChild, Input } from '@angular/core';
import { FormGroup } from '@angular/forms';

import { FieldWrapper } from '../../../eav-dynamic-form/model/field-wrapper';
import { FieldConfig } from '../../../eav-dynamic-form/model/field-config';
import { trigger, state, transition, animate, style, keyframes } from '@angular/animations';

@Component({
  selector: 'app-expandable-wrapper',
  templateUrl: './expandable-wrapper.component.html',
  styleUrls: ['./expandable-wrapper.component.scss'],
  animations: [
    trigger('itemShrinkAnimation', [
      state('open', style({
        height: '30vh'
      })),
      state('closed', style({
        height: '0vh'
      })),
      transition('open => closed', [
        animate('300ms ease'),
      ]),
    ]),
    trigger('contentExpandAnimation', [
      state('closed', style({
        height: '0',
      })),
      state('expanded', style({
        'min-height': 'calc(75vh - 38px)'
      })),
      transition('closed => expanded', [
        animate('300ms ease', keyframes([
          style({ 'height': '0vh', overflow: 'hidden' }),
          style({ 'height': 'calc(75vh - 38px)', overflow: 'hidden' }),
        ])),
      ]),
    ]),
  ],
})

export class ExpandableWrapperComponent implements FieldWrapper, OnInit {
  @ViewChild('fieldComponent', { read: ViewContainerRef }) fieldComponent: ViewContainerRef;

  @Input() config: FieldConfig;
  group: FormGroup;

  dialogIsOpen = false;

  get value() {
    return this.group.controls[this.config.name].value;
  }

  get id() {
    return `${this.config.entityId}${this.config.index}`;
  }

  constructor() { }

  ngOnInit() {

  }
}
