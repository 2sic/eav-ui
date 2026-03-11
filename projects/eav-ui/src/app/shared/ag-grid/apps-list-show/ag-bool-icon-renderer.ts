import { NgClass, NgTemplateOutlet } from '@angular/common';
import { Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { AgGridCellRendererBaseComponent } from '../../ag-grid/ag-grid-cell-renderer-base';
import { TippyDirective } from '../../directives/tippy.directive';
import { AgBoolCellIconsDefault, AgBoolCellIconSetting, AgBoolCellIconSettings, AgBoolCellIconsParams } from './ag-bool-icon-params';

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
export class AgBoolIconRenderer
  extends AgGridCellRendererBaseComponent<unknown, boolean, AgBoolCellIconsParams> {

  get allSettings(): AgBoolCellIconSettings { return this.params.settings?.(this.data) ?? AgBoolCellIconsDefault; }
  get stateKey(): 'true' | 'false' { return this.value ? 'true' : 'false'; }
  get state(): AgBoolCellIconSetting { return this.allSettings.states[this.stateKey]; }
  get cellData(): AgBoolCellIconSetting { return { ...this.state, url: this.state.url ?? this.state.getUrl?.(this.data) }; }

}