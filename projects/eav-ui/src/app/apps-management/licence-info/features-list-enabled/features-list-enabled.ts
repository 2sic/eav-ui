import { ICellRendererAngularComp } from '@ag-grid-community/angular';
import { ICellRendererParams } from '@ag-grid-community/core';
import { Component, inject } from '@angular/core';
import { MatBadgeModule } from '@angular/material/badge';
import { MatRippleModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';
import { DialogRoutingState } from '../../../edit/dialog/dialogRouteState.model';
import { Feature } from '../../../features/models';
import { TippyDirective } from '../../../shared/directives/tippy.directive';
import { OverrideContentsLogData } from './feature-list.model';

@Component({
  selector: 'app-features-list-settings',
  templateUrl: './features-list-enabled.html',
  styleUrls: ['./features-list-enabled.scss'],
  imports: [MatIconModule, MatBadgeModule, MatRippleModule, TippyDirective]
})
export class FeaturesListEnabledComponent implements ICellRendererAngularComp {
  router = inject(Router);
  configurationContentType: string | undefined;
  contentType: Feature | undefined;
  badgeValue: number
  configurationData: OverrideContentsLogData; // TYPE

  public params: {
    /** Parent helper to build URL to the settings dialog */
    getSettingsUrl(contentType: Feature, data: Record<string, unknown>): string;
  };

  value: boolean;

  agInit(params: ICellRendererParams & FeaturesListEnabledComponent["params"]): void {
    this.params = params;
    this.value = params.value;
    this.configurationContentType = params.data.configurationContentType;
    this.contentType = params.data;

    this.configurationData = params.data?.configuration;
    this.badgeValue = this.configurationData && Object.keys(this.configurationData).length > 0 ? 1 : 0;
  }

  refresh(params?: any): boolean {
    return true;
  }

  openSettings() {
    const data: Record<string, unknown> = {
      // The guid, just for the round-trip so we know what to update after dialog close
      guid: this.contentType.guid,
      // Default / fallback, in case no configuration is set
      enabled: this.contentType.enabledInConfiguration,
      ...(this.configurationData ?? {}),
    };

    // TODO: All this custom URL handling looks wrong, should probably be fixed

    // Raw URL string, e.g. '#/2/v2/381/...'
    const rawUrl = this.params.getSettingsUrl(this.contentType, data);

    // Remove leading '#' or '/' to clean the URL string
    const normalizedUrl = rawUrl.startsWith('#') || rawUrl.startsWith('/')
      ? rawUrl.substring(1)
      : rawUrl;

    // Convert the cleaned URL string into individual route segments
    const routeSegments = normalizedUrl.split('/');

    // Use Angular router to navigate to the route segments with custom state
    this.router.navigate(routeSegments, {
      state: {
        returnValue: true,
      } satisfies DialogRoutingState,
    });
  }
}
