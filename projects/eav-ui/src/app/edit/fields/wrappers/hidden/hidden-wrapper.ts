import { Component, inject, ViewChild, ViewContainerRef } from '@angular/core';
import { FieldState } from '../../field-state';
import { WrappersCatalog } from '../wrappers.constants';

@Component({
    selector: WrappersCatalog.HiddenWrapper,
    templateUrl: './hidden-wrapper.html',
    imports: []
})
export class HiddenWrapperComponent {
  @ViewChild('fieldComponent', { static: true, read: ViewContainerRef }) fieldComponent: ViewContainerRef;

  protected fieldState = inject(FieldState);
  protected basics = this.fieldState.basics;

  constructor() { }
}
