import { ICellRendererAngularComp } from '@ag-grid-community/angular';
import { ICellRendererParams } from '@ag-grid-community/core';
import { Component } from '@angular/core';
import { ContentType } from '../../models';
import { DataItemsParams } from './data-items.models';
import { MatIconModule } from '@angular/material/icon';
import { MatRippleModule } from '@angular/material/core';
import { TippyDirective } from '../../../shared/directives/tippy.directive';

@Component({
  selector: 'app-data-items',
  templateUrl: './data-items.component.html',
  styleUrls: ['./data-items.component.scss'],
  standalone: true,
  imports: [
    MatRippleModule,
    MatIconModule,
    TippyDirective,
  ],
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
