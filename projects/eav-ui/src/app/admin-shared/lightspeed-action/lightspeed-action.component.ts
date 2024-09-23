import { Component, Input, inject } from '@angular/core';
import { LightSpeedInfo } from '../../apps-management/models/LightSpeedInfo';
import { LightSpeedActionsParams } from './lightspeed-actions.models';
import { MatRippleModule } from '@angular/material/core';
import { MatBadgeModule } from '@angular/material/badge';
import { MatIconModule } from '@angular/material/icon';
import { FeaturesScopedService } from '../../features/features-scoped.service';
import { FeatureNames } from '../../features/feature-names';
import { TippyDirective } from '../../shared/directives/tippy.directive';

/**
 * LightSpeedActionsComponent
 *
 * Specially meant to be used inside an AGGrid action, and receive the parameters from it.
 *
 */
@Component({
  selector: 'app-lightspeed-action',
  templateUrl: './lightspeed-action.component.html',
  standalone: true,
  imports: [
    TippyDirective,
    MatIconModule,
    MatBadgeModule,
    MatRippleModule,
  ],
})
export class LightSpeedActionsComponent {
  /** App needed for lightspeed checks */
  @Input({ required: true }) lightSpeedOwner: unknown;

  @Input({ required: true }) params: LightSpeedActionsParams;

  @Input({ required: true }) lightSpeed: LightSpeedInfo | null;

  public features = inject(FeaturesScopedService);

  constructor() { }

  protected lightSpeedEnabled = this.features.isEnabled[FeatureNames.LightSpeed]

  public get appHasLightSpeed(): boolean {
    return this.lightSpeed?.Id != null;
  }

  public get appLightSpeedEnabled(): boolean {
    return this.lightSpeed?.IsEnabled == true;
  }

  openLightspeed(): void {
    this.params.onOpenLightspeed(this.lightSpeedOwner);
  }

  openLightspeedFeatureInfo(): void {
    this.params.openLightspeedFeatureInfo();
  }
}
