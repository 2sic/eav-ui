import { ICellRendererAngularComp } from '@ag-grid-community/angular';
import { ICellRendererParams } from '@ag-grid-community/core';
import { Component } from '@angular/core';
import { ContentType } from '../../models';
import { DataItemsParams } from './data-items.models';

@Component({
  selector: 'app-data-items',
  templateUrl: './data-items.component.html',
  styleUrls: ['./data-items.component.scss'],
})
export class DataItemsComponent implements ICellRendererAngularComp {
  value: number;
  private params: DataItemsParams;
  private contentType: ContentType;

  agInit(params: ICellRendererParams & DataItemsParams): void {
    this.params = params;
    this.contentType = params.data;
    this.value = params.value;
  }

  refresh(params?: any): boolean {
    return true;
  }

  showItems(): void {
    this.params.onShowItems(this.contentType);
  }

  addItem(): void {
    this.params.onAddItem(this.contentType);
  }
}
