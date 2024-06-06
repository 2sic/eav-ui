import { Component, Input } from '@angular/core';
import { App } from '../../apps-management/models/app.model';
import { LightSpeedInfo } from '../../apps-management/models/LightSpeedInfo';
import { LightSpeedActionsParams } from './lightspeed-actions.models';
import { MatRippleModule } from '@angular/material/core';
import { MatBadgeModule } from '@angular/material/badge';
import { MatIconModule } from '@angular/material/icon';
import { TippyStandaloneDirective } from '../../shared/directives/tippy-Standalone.directive';
import { View } from '../../app-administration/models';
import { FeaturesService } from '../../shared/services/features.service';
import { FeatureNames } from '../../features/feature-names';
import { take } from 'rxjs';

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
    TippyStandaloneDirective,
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

  public lightSpeedEnabled: boolean;

  constructor(private featuresService: FeaturesService) {
    this.featuresService.isEnabled$(FeatureNames.LightSpeed)
      .pipe(take(1))
      .subscribe((enabled) => { this.lightSpeedEnabled = enabled; });
  }

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
