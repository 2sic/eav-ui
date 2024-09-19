import { Component, inject, ViewChild, ViewContainerRef } from '@angular/core';
import { FieldState } from '../../field-state';
import { WrappersCatalog } from '../wrappers.constants';
import { computedObj } from '../../../../shared/signals/signal.utilities';
import { NgClass } from '@angular/common';

@Component({
  selector: WrappersCatalog.FeatureWarningWrapper,
  templateUrl: './feature-warning-wrapper.component.html',
  styleUrls: ['./feature-warning-wrapper.component.scss'],
  standalone: true,
  imports: [
    NgClass,
  ],
})
export class FeatureWarningWrapperComponent {
  @ViewChild('fieldComponent', { static: true, read: ViewContainerRef }) fieldComponent: ViewContainerRef;

  protected fieldState = inject(FieldState);

  requiredFeatures = computedObj('requiredFeatures', () => {
    const req = this.fieldState.requiredFeatures();
    if (req.length === 0) return req;
    // TODO: CHECK IF FEATURE IS ENABLED
    return req;
  });

  constructor() {
    console.warn('FeatureWarningWrapperComponent was added.');
  }

  protected basics = this.fieldState.basics;
}
