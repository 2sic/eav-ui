import { ICellRendererAngularComp } from '@ag-grid-community/angular';
import { ICellRendererParams } from '@ag-grid-community/core';
import { Component } from '@angular/core';
import { ContentItem } from '../models/content-item.model';
import { ContentItemsActionsParams, ContentItemType } from './content-items-actions.models';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';
import { MatRippleModule } from '@angular/material/core';

@Component({
  selector: 'app-content-items-actions',
  templateUrl: './content-items-actions.component.html',
  styleUrls: ['./content-items-actions.component.scss'],
  standalone: true,
  imports: [
    MatRippleModule,
    MatIconModule,
    MatMenuModule,
  ],
})
export class ContentItemsActionsComponent implements ICellRendererAngularComp {
  item: ContentItem;

  private params: ICellRendererParams & ContentItemsActionsParams;

  agInit(params: ICellRendererParams & ContentItemsActionsParams): void {
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
