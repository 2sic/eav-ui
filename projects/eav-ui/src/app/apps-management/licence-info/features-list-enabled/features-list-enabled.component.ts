import { ICellRendererAngularComp } from '@ag-grid-community/angular';
import { ICellRendererParams } from '@ag-grid-community/core';
import { Component, inject } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';
import { DialogRoutingState } from '../../../edit/dialog/dialogRouteState.model';
import { Feature } from '../../../features/models';

@Component({
  selector: 'app-features-list-settings',
  templateUrl: './features-list-enabled.component.html',
  imports: [MatIconModule]
})
export class FeaturesListEnabledComponent implements ICellRendererAngularComp {
  router = inject(Router);
  configurationContentType: string | undefined;
  contentType: Feature | undefined;

  public params: {
    addItemUrlTest(contentType: Feature): string;
    overrideContents: Record<string, unknown>[];
  };

  value: boolean;

  agInit(params: ICellRendererParams & FeaturesListEnabledComponent["params"]): void {
    this.params = params;
    this.value = params.value;
    this.configurationContentType = params.data.configurationContentType;
    this.contentType = params.data;
  }

  refresh(params?: any): boolean {
    return true;
  }


  openSettings() {

    const overrideContents = this.params.overrideContents.map(item => ({
      ...item,
      guid: this.contentType.guid,
    }));

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
