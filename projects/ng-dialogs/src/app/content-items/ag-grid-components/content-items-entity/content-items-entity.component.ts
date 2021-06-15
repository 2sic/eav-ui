import { ICellRendererParams } from '@ag-grid-community/all-modules';
import { ICellRendererAngularComp } from '@ag-grid-community/angular';
import { Component } from '@angular/core';
import { ExtendedColDef } from '../../models/extended-col-def.model';

@Component({
  selector: 'app-content-items-entity',
  templateUrl: './content-items-entity.component.html',
  styleUrls: ['./content-items-entity.component.scss'],
})
export class ContentItemsEntityComponent implements ICellRendererAngularComp {
  encodedValue: string;
  entities: number;

  agInit(params: ICellRendererParams) {
    if (!Array.isArray(params.value)) { return; }

    this.encodedValue = this.htmlEncode(params.value.join(', '));
    if ((params.colDef as ExtendedColDef).allowMultiValue) {
      this.entities = params.value.length;
    }
  }

  refresh(params?: any): boolean {
    return true;
  }

  // htmlencode strings (source: https://stackoverflow.com/a/7124052)
  private htmlEncode(text: string) {
    return text.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/'/g, '&#39;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }
}
