import { Component, inject } from '@angular/core';
import { MatBadgeModule } from '@angular/material/badge';
import { MatRippleModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';
import { Feature } from '../../../features/models';
import { AgGridCellRendererBaseComponent } from '../../../shared/ag-grid/ag-grid-cell-renderer-base';
import { TippyDirective } from '../../../shared/directives/tippy.directive';
import { FeatureConfigEdit } from '../feature-config-edit';


type FeaturesListRow = Feature & {
  configurationContentType?: string;
  configuration?: Record<string, unknown>;
};

@Component({
  selector: 'app-features-list-settings',
  templateUrl: './features-list-enabled.html',
  styleUrls: ['./features-list-enabled.scss'],
  imports: [MatIconModule, MatBadgeModule, MatRippleModule, TippyDirective]
})
export class FeaturesListEnabledComponent
  extends AgGridCellRendererBaseComponent<FeaturesListRow, boolean, FeaturesListEnabledParams> {

  private readonly router = inject(Router);

  get configurationContentType(): string | undefined { return this.data?.configurationContentType; }

  get contentType(): Feature { return this.data; }

  get configurationData(): Record<string, unknown> { return this.data?.configuration ?? {}; }

  get badgeValue(): number { return Object.keys(this.configurationData).length > 0 ? 1 : 0; }

  openSettings(): void {
    const data: FeatureConfigEdit = {
      guid: this.contentType.guid,
      enabled: this.contentType.enabledInConfiguration,
      ...this.configurationData,
    };

    const rawUrl = this.params.getSettingsUrl(this.contentType, data);
    const normalizedUrl = rawUrl.startsWith('#') || rawUrl.startsWith('/')
      ? rawUrl.substring(1)
      : rawUrl;
    const routeSegments = normalizedUrl.split('/');

    this.router.navigate(routeSegments);
  }
}

export interface FeaturesListEnabledParams {
  /** Parent helper to build URL to the settings dialog */
  getSettingsUrl(contentType: Feature, data: Record<string, unknown>): string;
}