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
  templateUrl: './features-list-enabled.component.html',
  styleUrls: ['./features-list-enabled.component.scss'],
  imports: [MatIconModule, MatBadgeModule, MatRippleModule, TippyDirective]
})
export class FeaturesListEnabledComponent implements ICellRendererAngularComp {
  router = inject(Router);
  configurationContentType: string | undefined;
  contentType: Feature | undefined;
  badgeValue: number
  configurationData: OverrideContentsLogData; // TYPE

  public params: {
    addItemUrlTest(contentType: Feature): string;
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

    const { ...configuration } = this.configurationData ?? {};

    const overrideContents: Record<string, unknown>[] = [
      {
        guid: this.contentType.guid,
        enabled: this.contentType.enabledInConfiguration,
        ...configuration
      }
    ];

    // Raw URL string, e.g. '#/2/v2/381/...'
    const rawUrl = this.params.addItemUrlTest(this.contentType);

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
        overrideContents,
      } satisfies DialogRoutingState,
    });
  }

}
