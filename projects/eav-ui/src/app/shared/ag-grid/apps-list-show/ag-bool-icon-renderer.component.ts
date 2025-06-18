import { ICellRendererAngularComp } from '@ag-grid-community/angular';
import { ICellRendererParams } from '@ag-grid-community/core';
import { NgClass, NgTemplateOutlet } from '@angular/common';
import { Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { TippyDirective } from '../../directives/tippy.directive';
import { AgBoolCellIconSetting, AgBoolCellIconSettings, AgBoolCellIconsDefault, AgBoolCellIconsParams } from './ag-bool-icon-params';

@Component({
  selector: 'app-ag-bool-icon-renderer',
  templateUrl: './ag-bool-icon-renderer.html',
  imports: [
    TippyDirective,
    MatIconModule,
    NgClass,
    NgTemplateOutlet
  ]
})
export class AgBoolIconRenderer implements ICellRendererAngularComp {
  value: boolean;

  private allSettings: AgBoolCellIconSettings;

  data: AgBoolCellIconSetting; // | { link: boolean  };

  agInit(params: ICellRendererParams & AgBoolCellIconsParams): void {
    this.value = params.value;

    this.allSettings = params.settings?.(params.data) ?? AgBoolCellIconsDefault;
    const d = this.allSettings.states[this.value ? 'true' : 'false'];
    this.data = {
      ...d,
      url: d.url ?? d.getUrl?.(params.data),
      // link: !!(d.url || d.getUrl),
    };
  }

  refresh(params?: any): boolean {
    return true;
  }
}
