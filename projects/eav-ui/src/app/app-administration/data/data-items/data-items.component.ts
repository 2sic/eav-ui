import { ICellRendererAngularComp } from '@ag-grid-community/angular';
import { ICellRendererParams } from '@ag-grid-community/core';
import { Component, inject } from '@angular/core';
import { MatRippleModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';
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
    itemsUrl(contentType: ContentType): string;
  };

  protected contentType: ContentType;

  agInit(params: ICellRendererParams & DataItemsComponent["params"]): void {
    this.params = params;
    this.contentType = params.data;
    this.value = params.value;
  }

  refresh(params?: any): boolean {
    return true;
  }

}
