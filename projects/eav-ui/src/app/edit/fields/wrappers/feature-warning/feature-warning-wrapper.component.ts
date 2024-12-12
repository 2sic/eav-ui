import { NgClass } from '@angular/common';
import { Component, inject, ViewChild, ViewContainerRef } from '@angular/core';
import { FeatureIconComponent } from '../../../../features/feature-icon/feature-icon.component';
import { FeaturesService } from '../../../../features/features.service';
import { computedObj } from '../../../../shared/signals/signal.utilities';
import { FieldState } from '../../field-state';
import { WrappersCatalog } from '../wrappers.constants';

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

  #features = inject(FeaturesService);

  constructor() { }

  requiredFeatures = computedObj('requiredFeatures', () => {
    const req = this.#fieldState.requiredFeatures();
    if (req.length === 0) return req;
    // Check if feature is allowed to be used - NOT if it's enabled
    return req.filter(f => !this.#features.allowUse[f]());
  });

  protected basics = this.#fieldState.basics;
}
