import { Component, inject, input } from '@angular/core';
import { MatBadgeModule } from '@angular/material/badge';
import { MatRippleModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { LightSpeedInfo } from '../../apps-management/models/LightSpeedInfo';
import { FeatureNames } from '../../features/feature-names';
import { FeaturesScopedService } from '../../features/features-scoped.service';
import { TippyDirective } from '../../shared/directives/tippy.directive';
import { LightSpeedActionsParams } from './lightspeed-actions.models';

/**
 * LightSpeedActionsComponent
 *
 * Specially meant to be used inside an AGGrid action, and receive the parameters from it.
 *
 */
@Component({
    selector: 'app-lightspeed-action',
    templateUrl: './lightspeed-action.component.html',
    imports: [
        TippyDirective,
        MatIconModule,
        MatBadgeModule,
        MatRippleModule,
    ]
})
export class LightSpeedActionsComponent {
  /** App needed for lightspeed checks */
  lightSpeedOwner = input.required<unknown>();

  params = input.required<LightSpeedActionsParams>();

  lightSpeed = input.required<LightSpeedInfo | null>();

  public features = inject(FeaturesScopedService);

  constructor() { }

  protected lightSpeedEnabled = this.features.isEnabled[FeatureNames.LightSpeed]

  public get appHasLightSpeed(): boolean {
    return this.lightSpeed()?.Id != null;
  }

  public get appLightSpeedEnabled(): boolean {
    return this.lightSpeed()?.IsEnabled == true;
  }

  openLightspeedFeatureInfo(): void {
    this.params().openLightspeedFeatureInfo();
  }
}
