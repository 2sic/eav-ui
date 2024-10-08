import { ICellRendererAngularComp } from '@ag-grid-community/angular';
import { ICellRendererParams } from '@ag-grid-community/core';
import { Component } from '@angular/core';
import { MatRippleModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { transient } from 'projects/core';
import { TippyDirective } from '../../../../shared/directives/tippy.directive';
import { ClipboardService } from '../../../../shared/services/clipboard.service';

@Component({
  selector: 'app-views-usage-id',
  templateUrl: './views-usage-id.component.html',
  styleUrls: ['./views-usage-id.component.scss'],
  standalone: true,
  imports: [
    MatRippleModule,
    MatIconModule,
    TippyDirective,
  ],
})
export class ViewsUsageIdComponent implements ICellRendererAngularComp {
  tooltip: string;
  id: string;

  constructor() { }

  protected clipboard = transient(ClipboardService);

  agInit(params: ICellRendererParams) {
    this.tooltip = params.value;
    if (this.tooltip == null) return;
    const idPart = this.tooltip.split('\n')[0];
    this.id = idPart.split(' ')[1];
  }

  refresh(params?: any): boolean {
    return true;
  }
}
