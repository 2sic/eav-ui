import { ICellRendererAngularComp } from '@ag-grid-community/angular';
import { ICellRendererParams } from '@ag-grid-community/core';
import { Component } from '@angular/core';
import { AgBoolCellIconSettings, AgBoolCellIconsDefault, AgBoolCellIconsParams } from './ag-bool-icon-params';



@Component({
  selector: 'app-ag-bool-icon-renderer',
  templateUrl: './ag-bool-icon-renderer.html',
})
export class AgBoolIconRenderer implements ICellRendererAngularComp, AgBoolCellIconSettings {
  value: boolean;

  tooltips: Record<'true' | 'false' | string, string> = {};

  icons: Record<'true' | 'false' | string, string> = {};

  agInit(params: ICellRendererParams & AgBoolCellIconsParams): void {
    this.value = params.value;

    const settings = params.settings?.();
console.log('2dm - params', params, settings);
    this.tooltips = settings?.tooltips ?? AgBoolCellIconsDefault.tooltips;
    this.icons = settings?.icons ?? AgBoolCellIconsDefault.icons;
  }

  refresh(params?: any): boolean {
    return true;
  }
}
