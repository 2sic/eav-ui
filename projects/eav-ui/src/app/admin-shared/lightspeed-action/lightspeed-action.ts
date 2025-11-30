import { Component, inject, input } from '@angular/core';
import { MatRippleModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { LightSpeedInfo } from '../../apps-management/models/LightSpeedInfo';
import { FeatureNames } from '../../features/feature-names';
import { FeaturesService } from '../../features/features.service';
import { MatBadgeIconDirective } from '../../shared/directives/mat-badge-icon.directive';
import { TippyDirective } from '../../shared/directives/tippy.directive';

export interface LightSpeedActionsParams {
  openLightspeedFeatureInfo(): void;
  lightSpeedLink?: (app: unknown) => string;
}

/**
 * LightSpeedActionsComponent
 *
 * Specially meant to be used inside an AGGrid action, and receive the parameters from it.
 *
 */
@Component({
  selector: 'app-lightspeed-action',
  templateUrl: './lightspeed-action.html',
  imports: [
    TippyDirective,
    MatIconModule,
    MatBadgeIconDirective,
    MatRippleModule,
  ]
})
export class LightSpeedActions {
  /** App needed for lightspeed checks */
  lightSpeedOwner = input.required<unknown>();

  params = input.required<LightSpeedActionsParams>();

  lightSpeed = input.required<LightSpeedInfo | null>();

  public features = inject(FeaturesService);

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
