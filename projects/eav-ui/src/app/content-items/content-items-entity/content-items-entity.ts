import { Component } from '@angular/core';
import { AgGridCellRendererBaseComponent } from '../../shared/ag-grid/ag-grid-cell-renderer-base';
import { TippyDirective } from '../../shared/directives/tippy.directive';
import { ExtendedColDef } from '../models/extended-col-def.model';

@Component({
  selector: 'app-content-items-entity',
  templateUrl: './content-items-entity.html',
  styleUrls: ['./content-items-entity.scss'],
  imports: [TippyDirective]
})
export class ContentItemsEntityComponent
  extends AgGridCellRendererBaseComponent<unknown, string[]> {

  get encodedValue(): string {
    if (!Array.isArray(this.value)) 
      return '';
    
    return this.htmlEncode(this.value.join(', '));
  }

  get entities(): number | undefined {
    if (!Array.isArray(this.value)) 
      return undefined;

    const colDef = this.params.colDef as ExtendedColDef;
    if (!colDef.allowMultiValue) 
      return undefined;

    return this.value.length;
  }

  // htmlencode strings (source: https://stackoverflow.com/a/7124052)
  private htmlEncode(text: string): string {
    return text
      .replace(/&/g, '&amp;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }
}