import { ICellRendererAngularComp } from '@ag-grid-community/angular';
import { ICellRendererParams } from '@ag-grid-community/core';
import { Component } from '@angular/core';
import { ContentItem } from '../models/content-item.model';
import { PubMeta } from '../pub-meta-filter/pub-meta-filter.model';
import { ContentItemsStatusParams } from './content-items-status.models';
import { EavForInAdminUi } from '../../edit/shared/models/eav';
import { MatBadgeModule } from '@angular/material/badge';
import { NgClass } from '@angular/common';
import { MatRippleModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { SharedComponentsModule } from '../../shared/shared-components.module';

@Component({
    selector: 'app-content-items-status',
    templateUrl: './content-items-status.component.html',
    styleUrls: ['./content-items-status.component.scss'],
    standalone: true,
    imports: [
        SharedComponentsModule,
        MatIconModule,
        MatRippleModule,
        NgClass,
        MatBadgeModule,
    ],
})
export class ContentItemsStatusComponent implements ICellRendererAngularComp {
  value: PubMeta;
  disableMetadata: boolean;
  metadataCount: number;
  metadataTooltip: string;

  private item: ContentItem;
  private params: ICellRendererParams & ContentItemsStatusParams;

  agInit(params: ICellRendererParams & ContentItemsStatusParams): void {
    this.value = params.value;
    this.params = params;
    this.item = params.data;
    this.disableMetadata = this.item._EditInfo.DisableMetadata;

    this.metadataCount = this.item.Metadata?.length ?? 0;

    const mdf = this.item.For as EavForInAdminUi;
    this.metadataTooltip = mdf
      ? 'This item is metadata for:'
      + `\nTarget: ${mdf.Target}`
      + `\nTargetType: ${mdf.TargetType}`
      + (mdf.KeyNumber ? `\nNumber: ${mdf.KeyNumber}` : '')
      + (mdf.KeyString ? `\nString: ${mdf.KeyString}` : '')
      + (mdf.KeyGuid ? `\nGuid: ${mdf.KeyGuid}` : '')
      + (mdf.Title ? `\nTitle: ${mdf.Title}` : '')
      : 'This item is not metadata.';
    this.metadataTooltip += `\n\nThis item has ${this.metadataCount > 0 ? this.metadataCount : 'no'} other metadata ${this.metadataCount === 1 ? 'item' : 'items'} attached to it.`;
  }

  refresh(params?: any): boolean {
    return true;
  }

  openMetadata(): void {
    this.params.onOpenMetadata(this.item);
  }
}
