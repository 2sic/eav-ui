import { ICellRendererAngularComp } from '@ag-grid-community/angular';
import { ICellRendererParams } from '@ag-grid-community/core';
import { Component } from '@angular/core';
import { MatRippleModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { TippyDirective } from '../../../shared/directives/tippy.directive';
import { CopilotActionsParams, CopilotActionsType } from './copilot-actions.models';

@Component({
  selector: 'app-copilot-actions',
  templateUrl: './copilot-actions.html',
  imports: [MatRippleModule, MatIconModule, TippyDirective],
})
export class CopilotActionsComponent implements ICellRendererAngularComp {
  item: any;
  private params: ICellRendererParams & CopilotActionsParams;

  agInit(params: ICellRendererParams & CopilotActionsParams): void {
    this.params = params;
    this.item = params.data;
  }

  refresh(params?: any): boolean {
    return true;
  }

  do(verb: CopilotActionsType) {
    this.params.do(verb, this.item);
  }
}
