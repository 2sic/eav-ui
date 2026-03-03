import { Component } from '@angular/core';
import { MatRippleModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { AgGridActionsBaseComponent } from '../../../shared/ag-grid/ag-grid-actions-base';
import { TippyDirective } from '../../../shared/directives/tippy.directive';
import { ContentType } from '../../models';

export type DataItemsVerb = 'addItem' | 'openItems';

@Component({
  selector: 'app-data-items',
  templateUrl: './data-items.html',
  styleUrls: ['./data-items.scss'],
  imports: [MatRippleModule, MatIconModule, TippyDirective],
})
export class DataItemsComponent extends AgGridActionsBaseComponent<ContentType, 'addItem' | 'openItems'> {
  get value(): number {
    return (this.params?.value as number) ?? 0;
  }

  get contentType(): ContentType {
    return this.data;
  }
}