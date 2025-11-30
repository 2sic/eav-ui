import { Component, inject, input } from '@angular/core';
import { MatRippleModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { LightSpeedInfo } from '../../apps-management/models/LightSpeedInfo';
import { FeatureNames } from '../../features/feature-names';
import { FeaturesService } from '../../features/features.service';
import { MatBadgeIconDirective } from '../../shared/directives/mat-badge-icon.directive';
import { TippyDirective } from '../../shared/directives/tippy.directive';

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
  /**
   * App or view which owns this lightspeed.
   * Needed for lightspeed checks, will be passed back to the action handlers.
   */
  lightSpeedOwner = input.required<unknown>();

  params = input.required<{
    openLightspeedFeatureInfo(): void;
    lightSpeedLink?: (app: unknown) => string;
  }>();

  lightSpeed = input.required<LightSpeedInfo | null>();

  #featuresSvc = inject(FeaturesService);

  protected lightSpeedEnabled = this.#featuresSvc.isEnabled[FeatureNames.LightSpeed]

  constructor() { }


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
