import { Component, inject, ViewChild, ViewContainerRef } from '@angular/core';
import { WrappersConstants } from '../../../shared/constants';
import { FieldState } from '../../builder/fields-builder/field-state';

@Component({
  selector: WrappersConstants.HiddenWrapper,
  templateUrl: './hidden-wrapper.component.html',
  styleUrls: ['./hidden-wrapper.component.scss'],
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
