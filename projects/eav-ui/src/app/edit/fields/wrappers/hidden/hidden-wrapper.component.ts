import { Component, inject, ViewChild, ViewContainerRef } from '@angular/core';
import { FieldState } from '../../field-state';
import { WrappersConstants } from '../wrappers.constants';

@Component({
  selector: WrappersConstants.HiddenWrapper,
  templateUrl: './hidden-wrapper.component.html',
  standalone: true,
  imports: [],
})
export class HiddenWrapperComponent {
  @ViewChild('fieldComponent', { static: true, read: ViewContainerRef }) fieldComponent: ViewContainerRef;

  protected fieldState = inject(FieldState);
  protected basics = this.fieldState.basics;

  constructor() {
  }
}
