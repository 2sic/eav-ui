import { Component } from '@angular/core';
import { MatRippleModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { AgGridActionsBaseComponent } from '../../shared/ag-grid/ag-grid-actions-base';
import { TippyDirective } from '../../shared/directives/tippy.directive';
import { ContentItem } from '../models/content-item.model';

export type ContentItemsActionVerb = 'clone' | 'export' | 'delete';

@Component({
  selector: 'app-data-bundle-actions',
  templateUrl: './content-items-actions.html',
  imports: [
    MatRippleModule,
    MatIconModule,
    MatMenuModule,
    TippyDirective,
  ]
})
export class ContentItemsActionsComponent
  extends AgGridActionsBaseComponent<ContentItem, ContentItemsActionVerb> {

  get cloneUrl(): string { return this.params.urlTo('clone', this.data); }

  get disableDelete(): boolean { return !!this.data?._EditInfo?.DisableDelete; }

  declare params: {
    do(verb: ContentItemsActionVerb, item: ContentItem): void;
    urlTo(verb: ContentItemsActionVerb, item: ContentItem): string;
  };
}