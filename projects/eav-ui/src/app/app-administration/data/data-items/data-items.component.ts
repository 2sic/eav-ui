import { ICellRendererAngularComp } from '@ag-grid-community/angular';
import { ICellRendererParams } from '@ag-grid-community/core';
import { Component, inject } from '@angular/core';
import { MatRippleModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';
import { DialogRoutingState } from '../../../edit/dialog/dialogRouteState.model';
import { TippyDirective } from '../../../shared/directives/tippy.directive';
import { ContentType } from '../../models';

@Component({
    selector: 'app-data-items',
    templateUrl: './data-items.component.html',
    styleUrls: ['./data-items.component.scss'],
    imports: [
        MatRippleModule,
        MatIconModule,
        TippyDirective,
    ]
})
export class DataItemsComponent implements ICellRendererAngularComp {
  value: number;

  router = inject(Router);


  
  /** Params, directly typed here and anywhere it's used should use this type definition */
  public params: {
    addItemUrl(contentType: ContentType): string;
    addItemUrlTest(contentType: ContentType): string;
    itemsUrl(contentType: ContentType): string;
  };

  protected contentType: ContentType;

  agInit(params: ICellRendererParams & DataItemsComponent["params"]): void {
    this.params = params;
    this.contentType = params.data;
    console.log("2dg params",params.data)
    this.value = params.value;
  }

  refresh(params?: any): boolean {
    return true;
  }

navigateToItemWithState(): void {
  // Example: Add override contents for debugging or default values
  const overrideContents: Record<string, unknown>[] = [
    { StringTest: 'Test State Data 2dg' },
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
