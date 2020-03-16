import { Component } from '@angular/core';
import { ICellRendererAngularComp } from '@ag-grid-community/angular';
import { ICellRendererParams } from '@ag-grid-community/all-modules';

import { ExtendedColDef } from '../../models/extended-col-def.model';

@Component({
  selector: 'app-content-items-entity',
  templateUrl: './content-items-entity.component.html',
  styleUrls: ['./content-items-entity.component.scss']
})
export class ContentItemsEntityComponent implements ICellRendererAngularComp {
  params: ICellRendererParams;
  encodedValue: string;
  entities: number;

  agInit(params: ICellRendererParams) {
    this.params = params;
    if (!Array.isArray(params.value)) { return; }

    this.encodedValue = this.htmlEncode(params.value.join(', '));
    if ((<ExtendedColDef>params.colDef).allowMultiValue) {
      this.entities = params.value.length;
    }
  }

  refresh(params?: any): boolean {
    return true;
  }

  // htmlencode strings (source: http://stackoverflow.com/a/7124052)
  private htmlEncode(text: string) {
    return text.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/'/g, '&#39;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }
}
