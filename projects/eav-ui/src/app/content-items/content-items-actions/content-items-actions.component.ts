import { ICellRendererAngularComp } from '@ag-grid-community/angular';
import { ICellRendererParams } from '@ag-grid-community/core';
import { Component } from '@angular/core';
import { MatRippleModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { TippyDirective } from '../../shared/directives/tippy.directive';
import { ContentItem } from '../models/content-item.model';
import { ContentItemsActionsParams, ContentItemType } from './content-items-actions.models';

type GoToUrls = 'clone'

@Component({
    selector: 'app-data-bundle-actions',
    templateUrl: './content-items-actions.component.html',
    imports: [
        MatRippleModule,
        MatIconModule,
        MatMenuModule,
        TippyDirective,
    ]
})
export class ContentItemsActionsComponent implements ICellRendererAngularComp {
  protected item: ContentItem;

  public params: ContentItemsActionsParams & {
    urlTo(verb: GoToUrls, item: ContentItem): string;
  };

  agInit(params: ICellRendererParams & ContentItemsActionsComponent['params']): void {
    this.params = params;
    this.item = params.data;
  }

  refresh(params?: any): boolean {
    return true;
  }

  do(verb: ContentItemType): void {
    this.params.do(verb, this.item);
  }
}
