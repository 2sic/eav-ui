import { Component, inject, ViewChild, ViewContainerRef } from '@angular/core';
import { WrappersConstants } from '../../../shared/constants';
import { FieldState } from '../../field-state';

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
