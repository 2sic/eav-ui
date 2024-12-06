import { Component, inject, ViewChild, ViewContainerRef } from '@angular/core';
import { FieldState } from '../../field-state';
import { WrappersCatalog } from '../wrappers.constants';
import { computedObj } from '../../../../shared/signals/signal.utilities';
import { NgClass } from '@angular/common';
import { FeaturesScopedService } from '../../../../features/features-scoped.service';
import { FeatureIconComponent } from '../../../../features/feature-icon/feature-icon.component';

@Component({
    selector: WrappersCatalog.FeatureWarningWrapper,
    templateUrl: './feature-warning-wrapper.component.html',
    styleUrls: ['./feature-warning-wrapper.component.scss'],
    imports: [
        NgClass,
        FeatureIconComponent,
    ]
})
export class FeatureWarningWrapperComponent {
  @ViewChild('fieldComponent', { static: true, read: ViewContainerRef }) fieldComponent: ViewContainerRef;

  #fieldState = inject(FieldState);

  #features = inject(FeaturesScopedService);

  constructor() { }

  requiredFeatures = computedObj('requiredFeatures', () => {
    const req = this.#fieldState.requiredFeatures();
    if (req.length === 0) return req;
    // Check if feature is allowed to be used - NOT if it's enabled
    return req.filter(f => !this.#features.allowUse[f]());
  });

  protected basics = this.#fieldState.basics;
}
