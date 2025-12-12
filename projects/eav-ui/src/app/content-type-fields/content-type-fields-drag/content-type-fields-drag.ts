import { ICellRendererAngularComp } from '@ag-grid-community/angular';
import { ICellRendererParams } from '@ag-grid-community/core';
import { Component } from '@angular/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

export interface ContentTypeFieldsDragParams {
  isReordering: () => boolean;
}

@Component({
  selector: 'app-content-type-fields-drag',
  template: `
    @if (isReordering()) {
      <div class="spinner-container">
        <mat-spinner diameter="16"></mat-spinner>
      </div>
    }
  `,
  styles: [`
    .spinner-container {
      display: flex;
      align-items: center;
      justify-content: center;
      height: 100%;
      width: 100%;
    }
  `],
  imports: [MatProgressSpinnerModule]
})
export class ContentTypeFieldsDragComponent implements ICellRendererAngularComp {
  private params!: ICellRendererParams & ContentTypeFieldsDragParams;
  
  isReordering!: () => boolean;

  agInit(params: ICellRendererParams & ContentTypeFieldsDragParams): void {
    this.params = params;
    this.isReordering = params.isReordering;
  }

  refresh(params: ICellRendererParams & ContentTypeFieldsDragParams): boolean {
    this.params = params;
    return true;
  }
}