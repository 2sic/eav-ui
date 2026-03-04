import { Component } from '@angular/core';
import { MatRippleModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { AgGridActionsBaseComponent } from '../../../shared/ag-grid/ag-grid-actions-base';
import { TippyDirective } from '../../../shared/directives/tippy.directive';
import { DataCopilotConfiguration } from '../copilot-generator';

@Component({
  selector: 'app-copilot-actions',
  templateUrl: './copilot-actions.html',
  imports: [
    MatRippleModule,
    MatIconModule,
    TippyDirective,
  ],
})
export class CopilotActionsComponent extends AgGridActionsBaseComponent<DataCopilotConfiguration, 'generate' | 'delete'> {}

// old example for @2rb

// export class CopilotActionsComponent implements ICellRendererAngularComp {
//   item: any;
//   private params: ICellRendererParams & CopilotActionsParams;

//   agInit(params: ICellRendererParams & CopilotActionsParams): void {
//     this.params = params;
//     this.item = params.data;
//   }

//   refresh(params?: any): boolean {
//     return true;
//   }

//   do(verb: CopilotActionsType) {
//     this.params.do(verb, this.item);
//   }
// }
